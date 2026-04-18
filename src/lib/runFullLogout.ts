import type { NavigateFunction } from "react-router-dom";
import { logoutRemote } from "../api/logout";
import type { AppDispatch } from "../store/store";
import { clearUserProfile } from "../store/slices/userSlice";
import { clearClientAuthStorage } from "./clearClientAuth";

export type FullLogoutOptions = {
  getAccessToken: () => Promise<string | null>;
  dispatch: AppDispatch;
  signOut: () => void;
  navigate: NavigateFunction;
};

/**
 * Calls remote logout when a token exists, then always clears client auth
 * storage, Redux user slice, and session cookies via `signOut`.
 * Redirects to `/login`. If the API fails, `logoutError` is passed in
 * navigation state for the login page banner.
 */
export async function runFullLogout({
  getAccessToken,
  dispatch,
  signOut,
  navigate,
}: FullLogoutOptions): Promise<void> {
  let logoutError: string | null = null;
  const token = await getAccessToken();

  if (token) {
    try {
      await logoutRemote(token);
    } catch {
      logoutError = "Logout failed, please try again.";
    }
  }

  clearClientAuthStorage();
  dispatch(clearUserProfile());
  signOut();

  navigate("/login", {
    replace: true,
    state: logoutError ? { logoutError } : undefined,
  });
}
