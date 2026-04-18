import { getSupabaseAnonKey, getSupabaseUrl } from "../lib/env";
import { parseGoTrueErrorMessage } from "./authErrors";

export type RefreshTokenSuccess = {
  access_token: string;
  refresh_token: string;
};

export async function refreshWithToken(
  refreshToken: string,
): Promise<RefreshTokenSuccess> {
  const url = `${getSupabaseUrl()}/auth/v1/token?grant_type=refresh_token`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: getSupabaseAnonKey(),
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseGoTrueErrorMessage(data));
  }

  const parsed = data as Record<string, unknown>;
  const access =
    typeof parsed.access_token === "string" ? parsed.access_token : null;
  const refresh =
    typeof parsed.refresh_token === "string" ? parsed.refresh_token : null;

  if (!access || !refresh) {
    throw new Error("Could not refresh session.");
  }

  return { access_token: access, refresh_token: refresh };
}
