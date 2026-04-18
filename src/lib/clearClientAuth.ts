import { clearAuthCookies } from "./authCookies";
import { clearRecoveryTokens } from "./recoveryStorage";

/** Legacy keys if any code path still used localStorage for tokens. */
const LEGACY_LOCAL_KEYS = [
  "taskly_access_token",
  "taskly_refresh_token",
] as const;

/**
 * Removes auth tokens from cookies, session storage (recovery), and any
 * legacy localStorage keys. Does not remove UI prefs (e.g. sidebar collapsed).
 */
export function clearClientAuthStorage(): void {
  clearAuthCookies();
  clearRecoveryTokens();
  for (const key of LEGACY_LOCAL_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}
