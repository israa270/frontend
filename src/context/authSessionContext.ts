import { createContext } from "react";
import type { StoredAuthUser } from "../lib/authCookies";

export type AuthSessionContextValue = {
  user: StoredAuthUser | null;
  isHydrated: boolean;
  signOut: () => void;
  /** Re-read cookies into React state (call after login/sign-up writes cookies). */
  syncFromCookies: () => void;
  /** Returns a usable access token, refreshing with refresh_token when needed. */
  getAccessToken: () => Promise<string | null>;
};

export const AuthSessionContext = createContext<AuthSessionContextValue | null>(
  null,
);
