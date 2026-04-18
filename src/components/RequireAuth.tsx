import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthSession } from "../hooks/useAuthSession";
import {
  getRefreshTokenFromCookie,
  getUserFromCookie,
} from "../lib/authCookies";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isHydrated, user } = useAuthSession();
  const location = useLocation();

  if (!isHydrated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-slate-medium">
        Loading…
      </div>
    );
  }

  const hasSession = Boolean(
    getRefreshTokenFromCookie() && (user ?? getUserFromCookie()),
  );
  if (!hasSession) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
