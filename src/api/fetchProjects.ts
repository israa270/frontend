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

/**
 * Loads projects via PostgREST RPC. Supabase expects POST with a JSON body for
 * `/rpc/*` (even when there are no arguments).
 */
export async function fetchProjects(
  accessToken: string,
): Promise<ProjectListItem[]> {
  const url = `${getSupabaseUrl()}/rest/v1/rpc/get_projects`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

  return data
    .map(normalizeProject)
    .filter((p): p is ProjectListItem => p !== null);
}
