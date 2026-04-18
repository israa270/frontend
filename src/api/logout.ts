import { parseGoTrueErrorMessage } from "./authErrors";
import { getSupabaseUrl } from "../lib/env";
import { supabaseUserHeaders } from "../lib/supabaseHeaders";

/** Invalidates the session on the auth server (Supabase GoTrue). */
export async function logoutRemote(accessToken: string): Promise<void> {
  const url = `${getSupabaseUrl()}/auth/v1/logout`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...supabaseUserHeaders(accessToken),
    },
    body: "{}",
  });

  const contentType = response.headers.get("content-type") ?? "";
  let data: unknown = null;
  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else {
    await response.text().catch(() => "");
  }

  if (!response.ok) {
    throw new Error(parseGoTrueErrorMessage(data));
  }
}
