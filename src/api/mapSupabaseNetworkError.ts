/** Browser `fetch` throws TypeError on DNS / CORS / offline — map to a clear message. */
export function mapSupabaseNetworkError(e: unknown): never {
  if (e instanceof TypeError) {
    throw new Error(
      "Cannot reach the API (network error). In dev, requests use the Vite proxy at /supabase — restart `pnpm dev` after changing .env. Confirm VITE_SUPABASE_URL matches Supabase → Settings → API.",
    );
  }
  throw e;
}
