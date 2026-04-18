import { getSupabaseUrl } from "../lib/env";
import { supabaseUserHeaders } from "../lib/supabaseHeaders";
import { parsePostgrestError } from "./restErrors";

export type CreateProjectBody = {
  name: string;
  description?: string | null;
};

export async function createProject(
  accessToken: string,
  body: CreateProjectBody,
): Promise<void> {
  const url = `${getSupabaseUrl()}/rest/v1/projects`;
  const payload: { name: string; description?: string } = {
    name: body.name.trim(),
  };
  const desc = body.description?.trim();
  if (desc) payload.description = desc;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
      ...supabaseUserHeaders(accessToken),
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) return;

  const data: unknown = await response.json().catch(() => null);
  throw new Error(parsePostgrestError(data));
}
