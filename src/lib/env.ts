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
  return requireEnv("VITE_SUPABASE_URL").replace(/\/$/, "");
}

export function getSupabaseAnonKey(): string {
  return requireEnv("VITE_SUPABASE_ANON_KEY");
}
