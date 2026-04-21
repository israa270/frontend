import { getSupabaseUrl } from "../lib/env";
import { supabaseUserHeaders } from "../lib/supabaseHeaders";
import { HttpError } from "./httpError";
import { parsePostgrestError } from "./restErrors";

export type UpdateProjectBody = {
  name: string;
  description?: string | null;
};

export async function updateProject(
  accessToken: string,
  projectId: string,
  body: UpdateProjectBody,
): Promise<void> {
  const encodedProjectId = encodeURIComponent(projectId);
  const url = `${getSupabaseUrl()}/rest/v1/projects?id=eq.${encodedProjectId}`;
  const payload: { name: string; description?: string } = {
    name: body.name.trim(),
  };
  const desc = body.description?.trim();
  if (desc) payload.description = desc;
  else payload.description = "";

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...supabaseUserHeaders(accessToken),
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    throw new HttpError("Unauthorized", 401);
  }
  if (response.ok) return;

  const data: unknown = await response.json().catch(() => null);
  throw new HttpError(parsePostgrestError(data), response.status);
}
