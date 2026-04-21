import { getSupabaseUrl } from "../lib/env";
import { supabaseUserHeaders } from "../lib/supabaseHeaders";
import { HttpError } from "./httpError";
import { parsePostgrestError } from "./restErrors";

export type CreateEpicBody = {
  title: string;
  description?: string | null;
  assigneeId?: string | null;
  projectId: string;
  deadline?: string | null;
};

export async function createEpic(
  accessToken: string,
  body: CreateEpicBody,
): Promise<void> {
  const url = `${getSupabaseUrl()}/rest/v1/epics`;
  const payload: Record<string, string> = {
    title: body.title.trim(),
    project_id: body.projectId,
  };
  const description = body.description?.trim();
  if (description) payload.description = description;
  if (body.assigneeId?.trim()) payload.assignee_id = body.assigneeId.trim();
  if (body.deadline?.trim()) payload.deadline = body.deadline.trim();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
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
