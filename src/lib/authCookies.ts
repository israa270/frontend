/**
 * Auth persistence in first-party cookies (Secure + SameSite when possible).
 * Note: HttpOnly is not available from browser JS; a backend proxy would be needed for that.
 */

const ACCESS = "taskly_access_token";
const REFRESH = "taskly_refresh_token";
const USER = "taskly_user";
const REMEMBER = "taskly_remember";

export type StoredAuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

export type AuthCookiePayload = {
  access_token: string;
  refresh_token: string;
  user: StoredAuthUser;
};

function secureCookieSuffix(): string {
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return "; Secure";
  }
  return "";
}

function buildCookiePair(
  name: string,
  value: string,
  maxAgeSec: number | null,
): string {
  const base = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${secureCookieSuffix()}`;
  if (maxAgeSec === null) return base;
  return `${base}; Max-Age=${maxAgeSec}`;
}

function setCookie(
  name: string,
  value: string,
  maxAgeSec: number | null,
): void {
  document.cookie = buildCookiePair(name, value, maxAgeSec);
}

function getCookie(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }
  return null;
}

function deleteCookie(name: string): void {
  document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Lax${secureCookieSuffix()}`;
}

const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function maxAgeForRemember(remember: boolean): number | null {
  return remember ? REMEMBER_MAX_AGE : null;
}

export function persistAuthCookies(
  payload: AuthCookiePayload,
  rememberMe: boolean,
): void {
  const maxAge = maxAgeForRemember(rememberMe);
  setCookie(REMEMBER, rememberMe ? "1" : "0", maxAge);
  setCookie(ACCESS, payload.access_token, maxAge);
  setCookie(REFRESH, payload.refresh_token, maxAge);
  setCookie(USER, JSON.stringify(payload.user), maxAge);
}

/** Refresh rotation: keep same remember policy from cookie. */
export function updateTokenCookies(
  access_token: string,
  refresh_token: string,
): void {
  const remember = getCookie(REMEMBER) === "1";
  const maxAge = maxAgeForRemember(remember);
  const userJson = getCookie(USER);
  setCookie(REMEMBER, remember ? "1" : "0", maxAge);
  setCookie(ACCESS, access_token, maxAge);
  setCookie(REFRESH, refresh_token, maxAge);
  if (userJson) setCookie(USER, userJson, maxAge);
}

export function readRememberFlag(): boolean {
  return getCookie(REMEMBER) === "1";
}

export function getAccessTokenFromCookie(): string | null {
  return getCookie(ACCESS);
}

export function getRefreshTokenFromCookie(): string | null {
  return getCookie(REFRESH);
}

export function getUserFromCookie(): StoredAuthUser | null {
  const raw = getCookie(USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuthUser;
  } catch {
    return null;
  }
}

export function clearAuthCookies(): void {
  deleteCookie(ACCESS);
  deleteCookie(REFRESH);
  deleteCookie(USER);
  deleteCookie(REMEMBER);
}
