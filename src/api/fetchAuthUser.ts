import { parseGoTrueErrorMessage } from "./authErrors";
import { getSupabaseUrl } from "../lib/env";
import { supabaseUserHeaders } from "../lib/supabaseHeaders";

export type AuthUserResponse = {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    job_title?: string;
    full_name?: string;
    [key: string]: unknown;
  };
};

export async function fetchAuthUser(
  accessToken: string,
): Promise<AuthUserResponse> {
  const url = `${getSupabaseUrl()}/auth/v1/user`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...supabaseUserHeaders(accessToken),
    },
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseGoTrueErrorMessage(data));
  }

  if (!data || typeof data !== "object" || !("id" in data)) {
    throw new Error("Invalid profile response.");
  }

  return data as AuthUserResponse;
}
