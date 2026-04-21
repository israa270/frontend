import { getSupabaseUrl } from "../lib/env";
import { supabaseUserHeaders } from "../lib/supabaseHeaders";
import { HttpError } from "./httpError";
import { parsePostgrestError } from "./restErrors";

export type ProjectListItem = {
  id: string;
  name: string;
  description: string;
  createdAt: string | null;
};

export type FetchProjectsParams = {
  accessToken: string;
  limit: number;
  offset: number;
};

export type FetchProjectsResult = {
  projects: ProjectListItem[];
  totalCount: number;
  rangeStart: number | null;
  rangeEnd: number | null;
};

function normalizeProject(row: unknown): ProjectListItem | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const name = r.name;
  if (typeof name !== "string" || !name.trim()) return null;
  let id: string;
  if (typeof r.id === "string") id = r.id;
  else if (typeof r.id === "number") id = String(r.id);
  else id = name.trim();
  const description =
    typeof r.description === "string"
      ? r.description
      : r.description == null
        ? ""
        : String(r.description);
  const createdAt =
    typeof r.created_at === "string"
      ? r.created_at
      : typeof r.createdAt === "string"
        ? r.createdAt
        : null;
  return {
    id,
    name: name.trim(),
    description,
    createdAt,
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
  const total =
    Number.isFinite(totalCount) && totalCount >= 0 ? totalCount : 0;
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

/**
 * Loads projects via PostgREST RPC with pagination metadata from Content-Range.
 */
export async function fetchProjects({
  accessToken,
  limit,
  offset,
}: FetchProjectsParams): Promise<FetchProjectsResult> {
  const safeLimit = Math.max(1, Math.floor(limit));
  const safeOffset = Math.max(0, Math.floor(offset));
  const qp = new URLSearchParams({
    limit: String(safeLimit),
    offset: String(safeOffset),
  });
  const url = `${getSupabaseUrl()}/rest/v1/rpc/get_projects?${qp.toString()}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "count=exact",
      ...supabaseUserHeaders(accessToken),
    },
    body: "{}",
  });

  if (response.status === 401) {
    throw new HttpError("Unauthorized", 401);
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new HttpError(parsePostgrestError(data), response.status);
  }

  if (!Array.isArray(data)) {
    throw new HttpError("Invalid projects response.", response.status);
  }

  const { totalCount, rangeStart, rangeEnd } = parseContentRangeHeader(
    response.headers.get("content-range"),
  );
  const projects = data
    .map(normalizeProject)
    .filter((p): p is ProjectListItem => p !== null);

  return {
    projects,
    totalCount,
    rangeStart,
    rangeEnd,
  };
}
