import { getSupabaseUrl } from "../lib/env";
import { supabaseUserHeaders } from "../lib/supabaseHeaders";
import { HttpError } from "./httpError";
import { parsePostgrestError } from "./restErrors";

export type ProjectDetails = {
  id: string;
  name: string;
  description: string;
};

function normalizeProjectDetails(row: unknown): ProjectDetails | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const id = r.id;
  const name = r.name;
  const description = r.description;
  if ((typeof id !== "string" && typeof id !== "number") || typeof name !== "string") {
    return null;
  }
  return {
    id: String(id),
    name: name.trim(),
    description: typeof description === "string" ? description : "",
  };
}

export async function fetchProjectById(
  accessToken: string,
  projectId: string,
): Promise<ProjectDetails> {
  const encodedProjectId = encodeURIComponent(projectId);
  const url = `${getSupabaseUrl()}/rest/v1/projects?id=eq.${encodedProjectId}&select=id,name,description`;
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
    throw new HttpError("Project not found.", 404);
  }

  const normalized = normalizeProjectDetails(data[0]);
  if (!normalized) {
    throw new HttpError("Invalid project response.", 500);
  }
  return normalized;
}
