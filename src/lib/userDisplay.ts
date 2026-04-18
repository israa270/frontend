import type { AuthUserResponse } from "../api/fetchAuthUser";
import type { StoredAuthUser } from "./authCookies";

/** Two words → first letter of each (e.g. Mahmoud Taha → MT). One word → first two letters (Mahmoud → MA). */
export function initialsFromDisplayName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0] ?? "";
    const b = parts[1][0] ?? "";
    return (a + b).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export function displayNameFromAuthUser(
  apiUser: AuthUserResponse | null,
  cookieUser: StoredAuthUser | null,
): string {
  const metaName =
    apiUser?.user_metadata && typeof apiUser.user_metadata.name === "string"
      ? apiUser.user_metadata.name
      : undefined;
  const fullName =
    apiUser?.user_metadata &&
    typeof apiUser.user_metadata.full_name === "string"
      ? apiUser.user_metadata.full_name
      : undefined;
  const cookieMeta =
    cookieUser?.user_metadata &&
    typeof cookieUser.user_metadata.name === "string"
      ? cookieUser.user_metadata.name
      : undefined;
  return (
    metaName ??
    fullName ??
    cookieMeta ??
    apiUser?.email ??
    cookieUser?.email ??
    "User"
  );
}

export function jobTitleFromAuthUser(
  apiUser: AuthUserResponse | null,
  cookieUser: StoredAuthUser | null,
): string | null {
  const fromApi =
    apiUser?.user_metadata &&
    typeof apiUser.user_metadata.job_title === "string"
      ? apiUser.user_metadata.job_title.trim()
      : "";
  const fromCookie =
    cookieUser?.user_metadata &&
    typeof cookieUser.user_metadata.job_title === "string"
      ? String(cookieUser.user_metadata.job_title).trim()
      : "";
  const title = fromApi || fromCookie;
  return title.length > 0 ? title : null;
}
