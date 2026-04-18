function parseJwtPayload(accessToken: string): Record<string, unknown> | null {
  const parts = accessToken.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = parts[1];
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(
      padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="),
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Decode JWT `exp` (seconds since epoch) without verifying signature — client UX only. */
export function getJwtExpiryMs(accessToken: string): number | null {
  const parsed = parseJwtPayload(accessToken);
  if (!parsed || typeof parsed.exp !== "number") return null;
  return parsed.exp * 1000;
}

export function getJwtSubject(accessToken: string): string | null {
  const parsed = parseJwtPayload(accessToken);
  if (!parsed || typeof parsed.sub !== "string") return null;
  return parsed.sub;
}

/** True if token is missing or expires within `skewMs` (default 90s). */
export function isAccessTokenExpired(
  accessToken: string | null,
  skewMs = 90_000,
): boolean {
  if (!accessToken) return true;
  const exp = getJwtExpiryMs(accessToken);
  if (exp === null) return true;
  return Date.now() >= exp - skewMs;
}
