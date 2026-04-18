/** Browser `fetch` throws TypeError on DNS / CORS / offline — map to a clear message. */
export function mapSupabaseNetworkError(e: unknown): never {
  if (e instanceof TypeError) {
    throw new Error(
      "Cannot reach Supabase (network error). Check VITE_SUPABASE_URL in .env matches Supabase → Settings → API (single line), then restart the dev server.",
    );
  }
  throw e;
}
