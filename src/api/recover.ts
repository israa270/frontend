import { getSupabaseUrl } from "../lib/env";
import { supabaseAnonHeaders } from "../lib/supabaseHeaders";
import { parseGoTrueErrorMessage } from "./authErrors";

export async function requestPasswordRecovery(email: string): Promise<void> {
  const url = `${getSupabaseUrl()}/auth/v1/recover`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...supabaseAnonHeaders(),
    },
    body: JSON.stringify({ email: email.trim() }),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseGoTrueErrorMessage(data));
  }
}
