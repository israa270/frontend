import type { StoredAuthUser } from "../lib/authCookies";
import { getSupabaseAnonKey, getSupabaseUrl } from "../lib/env";
import { parseGoTrueErrorMessage } from "./authErrors";

export type PasswordLoginBody = {
  email: string;
  password: string;
};

export type PasswordLoginSuccess = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  expires_at?: number;
  user: StoredAuthUser;
};

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  user?: StoredAuthUser;
  session?: {
    access_token?: string;
    refresh_token?: string;
  };
};

export async function loginWithPassword(
  body: PasswordLoginBody,
): Promise<PasswordLoginSuccess> {
  const url = `${getSupabaseUrl()}/auth/v1/token?grant_type=password`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: getSupabaseAnonKey(),
    },
    body: JSON.stringify({
      email: body.email.trim(),
      password: body.password,
    }),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseGoTrueErrorMessage(data));
  }

  const parsed = data as TokenResponse;
  const access = parsed.access_token ?? parsed.session?.access_token ?? null;
  const refresh = parsed.refresh_token ?? parsed.session?.refresh_token ?? null;
  const user = parsed.user;

  if (!access || !refresh || !user || typeof user.id !== "string") {
    throw new Error("Unexpected response from server. Please try again.");
  }

  return {
    access_token: access,
    refresh_token: refresh,
    expires_in: parsed.expires_in,
    expires_at: parsed.expires_at,
    user,
  };
}
