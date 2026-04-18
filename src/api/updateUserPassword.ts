import { getSupabaseUrl } from "../lib/env";
import { supabaseUserHeaders } from "../lib/supabaseHeaders";
import { parseGoTrueErrorMessage } from "./authErrors";

export async function updateUserPassword(
  accessToken: string,
  newPassword: string,
): Promise<void> {
  const url = `${getSupabaseUrl()}/auth/v1/user`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...supabaseUserHeaders(accessToken),
    },
    body: JSON.stringify({ password: newPassword }),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseGoTrueErrorMessage(data));
  }
}
