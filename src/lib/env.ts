function requireEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(
      `Missing ${String(name)}. Copy .env.example to .env and set your Supabase project values.`,
    );
  }
  return value;
}

export function getSupabaseUrl(): string {
  const raw = requireEnv("VITE_SUPABASE_URL").trim().replace(/\/$/, "");
  let host: string;
  try {
    host = new URL(raw).hostname;
  } catch {
    throw new Error(
      "VITE_SUPABASE_URL must be a full URL (e.g. https://abcd1234.supabase.co).",
    );
  }
  if (!/^[a-z0-9-]+\.supabase\.co$/i.test(host)) {
    throw new Error(
      `VITE_SUPABASE_URL has host "${host}" but it must be "<project-ref>.supabase.co" (see Supabase → Settings → API). A broken or wrapped line in .env often causes "Failed to fetch".`,
    );
  }
  return raw;
}

export function getSupabaseAnonKey(): string {
  return requireEnv("VITE_SUPABASE_ANON_KEY");
}
