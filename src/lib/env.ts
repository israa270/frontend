function requireEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(
      `Missing ${String(name)}. Copy .env.example to .env and set your Supabase project values.`,
    );
  }
  return value;
}

function parseProjectUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  try {
    
    const u = new URL(trimmed);
    if (u.protocol !== "https:" && u.protocol !== "http:") {
      throw new Error("URL must start with https:// or http://");
    }
    if (!u.hostname) throw new Error("Missing hostname");
  } catch (e) {
    const hint = e instanceof Error ? e.message : "Invalid URL";
    throw new Error(
      `VITE_SUPABASE_URL is invalid (${hint}). Use the full Project URL from Supabase → Settings → API (one line in .env).`,
    );
  }
  return trimmed;
}

/**
 * Base URL for Supabase REST and GoTrue.
 * In development, requests go to `/supabase/...` and Vite proxies to `VITE_SUPABASE_URL`
 * so the browser stays same-origin (avoids many CORS / WSL / DNS "Failed to fetch" issues).
 */
export function getSupabaseUrl(): string {
  const raw = requireEnv("VITE_SUPABASE_URL");
  parseProjectUrl(raw);

  if (import.meta.env.DEV) {
    return "/supabase";
  }

  return raw.trim().replace(/\/$/, "");
}

export function getSupabaseAnonKey(): string {
  return requireEnv("VITE_SUPABASE_ANON_KEY");
}

export function getAuthEmailRedirectTo(): string {
  const raw = import.meta.env.VITE_AUTH_REDIRECT_URL;
  if (typeof raw === "string" && raw.trim().length > 0) {
    try {
      const url = new URL(raw.trim());
      return url.toString().replace(/\/$/, "");
    } catch {
      throw new Error(
        "VITE_AUTH_REDIRECT_URL is invalid. Use a full URL like https://your-app.vercel.app.",
      );
    }
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  throw new Error(
    "Unable to resolve auth redirect URL. Set VITE_AUTH_REDIRECT_URL in your environment.",
  );
}
