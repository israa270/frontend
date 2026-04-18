import { getSupabaseAnonKey } from "./env";

/**
 * GoTrue / REST requests without a user session. Legacy anon keys are JWTs and
 * must also be sent as `Authorization: Bearer` (matches supabase-js). New
 * publishable keys (`sb_publishable_*`) are apikey-only.
 */
export function supabaseAnonHeaders(): Record<string, string> {
  const anon = getSupabaseAnonKey();
  const headers: Record<string, string> = { apikey: anon };
  if (anon.startsWith("eyJ")) {
    headers.Authorization = `Bearer ${anon}`;
  }
  return headers;
}

/** Authenticated REST / GoTrue calls (user access token). */
export function supabaseUserHeaders(
  accessToken: string,
): Record<string, string> {
  const anon = getSupabaseAnonKey();
  return {
    apikey: anon,
    Authorization: `Bearer ${accessToken}`,
  };
}
