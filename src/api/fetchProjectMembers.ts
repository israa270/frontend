import { getSupabaseUrl } from "../lib/env";
import { supabaseUserHeaders } from "../lib/supabaseHeaders";
import { HttpError } from "./httpError";
import { parsePostgrestError } from "./restErrors";

export type ProjectMember = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
  joinedAt: string | null;
};

function normalizeRole(value: unknown): ProjectMember["role"] {
  if (typeof value !== "string") return "member";
  const normalized = value.toLowerCase();
  if (
    normalized === "owner" ||
    normalized === "admin" ||
    normalized === "member" ||
    normalized === "viewer"
  ) {
    return normalized;
  }
  return "member";
}

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function normalizeMember(row: unknown): ProjectMember | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const name = asString(r.name ?? r.full_name ?? r.user_name).trim();
  const email = asString(r.email ?? r.user_email).trim();
  const id = asString((r.id ?? r.user_id) || email || name).trim();
  if (!id || !name) return null;
  const joinedAtRaw = r.joined_at ?? r.joinedAt ?? r.created_at ?? r.createdAt;
  return {
    id,
    name,
    email,
    role: normalizeRole(r.role),
    joinedAt: typeof joinedAtRaw === "string" ? joinedAtRaw : null,
  };
}

export async function fetchProjectMembers(
  accessToken: string,
  projectId: string,
): Promise<ProjectMember[]> {
  const encodedProjectId = encodeURIComponent(projectId);
  const url = `${getSupabaseUrl()}/rest/v1/get_project_members?project_id=eq.${encodedProjectId}`;
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
    throw new HttpError("Invalid project members response.", response.status);
  }

  return data
    .map(normalizeMember)
    .filter((member): member is ProjectMember => member !== null);
}
