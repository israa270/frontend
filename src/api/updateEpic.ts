import { getSupabaseUrl } from "../lib/env";
import { supabaseUserHeaders } from "../lib/supabaseHeaders";
import { HttpError } from "./httpError";
import { parsePostgrestError } from "./restErrors";

export type UpdateEpicBody = {
  title: string;
  description?: string | null;
  assigneeId?: string | null;
  deadline?: string | null;
};

export async function updateEpic(
  accessToken: string,
  projectId: string,
  epicId: string,
  body: UpdateEpicBody,
): Promise<void> {
  const q = new URLSearchParams({
    id: `eq.${encodeURIComponent(epicId)}`,
    project_id: `eq.${encodeURIComponent(projectId)}`,
  });
  const url = `${getSupabaseUrl()}/rest/v1/epics?${q.toString()}`;
  const title = body.title.trim();
  const desc = body.description?.trim() ?? "";
  const payload: Record<string, string | null> = {
    title,
    description: desc || null,
    assignee_id: body.assigneeId?.trim() ? body.assigneeId.trim() : null,
    deadline: body.deadline?.trim() ? body.deadline.trim() : null,
  };
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
