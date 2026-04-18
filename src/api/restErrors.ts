/** PostgREST / Supabase REST error bodies. */
export function parsePostgrestError(data: unknown): string {
  if (typeof data === "object" && data !== null && "message" in data) {
    const m = (data as { message: unknown }).message;
    if (typeof m === "string" && m.length > 0) return m;
  }
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0];
    if (typeof first === "object" && first !== null && "message" in first) {
      const m = (first as { message: unknown }).message;
      if (typeof m === "string" && m.length > 0) return m;
    }
  }
  return "Something went wrong. Please try again.";
}
