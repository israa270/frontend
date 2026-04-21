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

export async function fetchProjectEpics(
  accessToken: string,
  projectId: string,
): Promise<ProjectEpicItem[]> {
  const encodedProjectId = encodeURIComponent(projectId);
  const url = `${getSupabaseUrl()}/rest/v1/project_epics?project_id=eq.${encodedProjectId}`;
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
  if (!Array.isArray(data)) {
    throw new HttpError("Invalid project epics response.", response.status);
  }
  return data
    .map(normalizeEpic)
    .filter((row): row is ProjectEpicItem => row !== null);
}
