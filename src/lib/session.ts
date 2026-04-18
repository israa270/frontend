const ACCESS = "taskly_access_token";
const REFRESH = "taskly_refresh_token";

export type AuthSessionPayload = {
  access_token: string;
  refresh_token: string;
};

export function persistSession(session: AuthSessionPayload | null): void {
  if (!session) {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    return;
  }
  localStorage.setItem(ACCESS, session.access_token);
  localStorage.setItem(REFRESH, session.refresh_token);
}
