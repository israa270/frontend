const ACCESS = "taskly_recovery_access";
const REFRESH = "taskly_recovery_refresh";

export function storeRecoveryTokens(access: string, refresh?: string): void {
  sessionStorage.setItem(ACCESS, access);
  if (refresh) sessionStorage.setItem(REFRESH, refresh);
  else sessionStorage.removeItem(REFRESH);
}

export function readRecoveryAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS);
}

export function readRecoveryRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH);
}

export function clearRecoveryTokens(): void {
  sessionStorage.removeItem(ACCESS);
  sessionStorage.removeItem(REFRESH);
}
