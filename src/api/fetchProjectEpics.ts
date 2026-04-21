import { getSupabaseUrl } from "../lib/env";
import { supabaseUserHeaders } from "../lib/supabaseHeaders";
import { HttpError } from "./httpError";
import { parsePostgrestError } from "./restErrors";

type EpicUser = {
  name: string;
  email: string;
};

export type ProjectEpicItem = {
  id: string;
  epicId: string;
  title: string;
  description: string;
  deadline: string | null;
  createdAt: string | null;
  createdBy: EpicUser | null;
  assignee: EpicUser | null;
};

export type FetchProjectEpicsParams = {
  accessToken: string;
  projectId: string;
  limit: number;
  offset: number;
};

export type FetchProjectEpicsResult = {
  epics: ProjectEpicItem[];
  totalCount: number;
  rangeStart: number | null;
  rangeEnd: number | null;
};

function normalizeUser(input: unknown): EpicUser | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;
  const name =
    typeof obj.name === "string" ? obj.name.trim() : "";
  const email =
    typeof obj.email === "string" ? obj.email.trim() : "";
  if (!name && !email) return null;
  return { name: name || "Unknown user", email };
}

function normalizeEpic(row: unknown): ProjectEpicItem | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const idRaw = r.id;
  const titleRaw = r.title;
  if ((typeof idRaw !== "string" && typeof idRaw !== "number") || typeof titleRaw !== "string") {
    return null;
  }
  const epicIdRaw = r.epic_id;
  return {
    id: String(idRaw),
    epicId:
      typeof epicIdRaw === "string" && epicIdRaw.trim()
        ? epicIdRaw.trim()
        : "EPIC",
    title: titleRaw.trim(),
    description: typeof r.description === "string" ? r.description : "",
    deadline: typeof r.deadline === "string" ? r.deadline : null,
    createdAt: typeof r.created_at === "string" ? r.created_at : null,
    createdBy: normalizeUser(r.created_by),
    assignee: normalizeUser(r.assignee),
  };
}

function parseContentRangeHeader(headerValue: string | null): {
  totalCount: number;
  rangeStart: number | null;
  rangeEnd: number | null;
} {
  if (!headerValue) {
    return { totalCount: 0, rangeStart: null, rangeEnd: null };
  }
  const [rangePart, totalPart] = headerValue.trim().split("/");
  const totalCount = Number.parseInt(totalPart ?? "0", 10);
  const total = Number.isFinite(totalCount) && totalCount >= 0 ? totalCount : 0;
  if (!rangePart || rangePart === "*") {
    return { totalCount: total, rangeStart: null, rangeEnd: null };
  }
  const [startRaw, endRaw] = rangePart.split("-");
  const start = Number.parseInt(startRaw ?? "", 10);
  const end = Number.parseInt(endRaw ?? "", 10);
  return {
    totalCount: total,
    rangeStart: Number.isFinite(start) && start >= 0 ? start : null,
    rangeEnd: Number.isFinite(end) && end >= 0 ? end : null,
  };
}

export async function fetchProjectEpics(
  params: FetchProjectEpicsParams,
): Promise<FetchProjectEpicsResult> {
  const { accessToken, projectId, limit, offset } = params;
  const safeLimit = Math.max(1, Math.floor(limit));
  const safeOffset = Math.max(0, Math.floor(offset));
  const encodedProjectId = encodeURIComponent(projectId);
  const query = new URLSearchParams({
    project_id: `eq.${encodedProjectId}`,
    limit: String(safeLimit),
    offset: String(safeOffset),
  });
  const url = `${getSupabaseUrl()}/rest/v1/project_epics?${query.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Prefer: "count=exact",
      ...supabaseUserHeaders(accessToken),
    },
  });

  if (response.status === 401) {
    throw new HttpError("Unauthorized", 401);
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new HttpError(parsePostgrestError(data), response.status);
  }
  if (!Array.isArray(data)) {
    throw new HttpError("Invalid project epics response.", response.status);
  }
  const epics = data
    .map(normalizeEpic)
    .filter((row): row is ProjectEpicItem => row !== null);
  const { totalCount, rangeStart, rangeEnd } = parseContentRangeHeader(
    response.headers.get("content-range"),
  );
  return { epics, totalCount, rangeStart, rangeEnd };
}

export async function fetchProjectEpicDetails(
  accessToken: string,
  projectId: string,
  epicId: string,
): Promise<ProjectEpicItem> {
  const encodedProjectId = encodeURIComponent(projectId);
  const encodedEpicId = encodeURIComponent(epicId);
  const query = new URLSearchParams({
    project_id: `eq.${encodedProjectId}`,
    id: `eq.${encodedEpicId}`,
  });
  const url = `${getSupabaseUrl()}/rest/v1/project_epics?${query.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...supabaseUserHeaders(accessToken),
    },
  });

  if (response.status === 401) {
    throw new HttpError("Unauthorized", 401);
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new HttpError(parsePostgrestError(data), response.status);
  }
  if (!Array.isArray(data) || data.length === 0) {
    throw new HttpError("Epic not found.", 404);
  }
  const epic = normalizeEpic(data[0]);
  if (!epic) {
    throw new HttpError("Invalid epic details response.", 500);
  }
  return epic;
}
