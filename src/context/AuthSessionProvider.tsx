import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { refreshWithToken } from "../api/refreshSession";
import {
  clearAuthCookies,
  getAccessTokenFromCookie,
  getRefreshTokenFromCookie,
  getUserFromCookie,
  updateTokenCookies,
  type StoredAuthUser,
} from "../lib/authCookies";
import { isAccessTokenExpired } from "../lib/jwt";
import { AuthSessionContext } from "./authSessionContext";

const REFRESH_INTERVAL_MS = 4 * 60 * 1000;

async function tryRefreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshTokenFromCookie();
  if (!refresh) return false;
  try {
    const next = await refreshWithToken(refresh);
    updateTokenCookies(next.access_token, next.refresh_token);
    return true;
  } catch {
    clearAuthCookies();
    return false;
  }
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredAuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const refreshLock = useRef<Promise<void> | null>(null);

  const hydrateFromCookies = useCallback(() => {
    if (!getRefreshTokenFromCookie()) {
      setUser(null);
      return;
    }
    setUser(getUserFromCookie());
  }, []);

  const ensureFreshAccessToken = useCallback(async (): Promise<void> => {
    if (refreshLock.current) {
      await refreshLock.current;
      return;
    }
    const access = getAccessTokenFromCookie();
    const refresh = getRefreshTokenFromCookie();
    if (!refresh) return;
    if (access && !isAccessTokenExpired(access)) return;

    const run = (async () => {
      await tryRefreshAccessToken();
      hydrateFromCookies();
    })();
    refreshLock.current = run.then(() => {
      refreshLock.current = null;
    });
    await refreshLock.current;
  }, [hydrateFromCookies]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const access = getAccessTokenFromCookie();
      const refresh = getRefreshTokenFromCookie();
      if (refresh && (!access || isAccessTokenExpired(access))) {
        await tryRefreshAccessToken();
      }
      if (!cancelled) {
        hydrateFromCookies();
        setIsHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrateFromCookies]);

  useEffect(() => {
    const tick = () => {
      void ensureFreshAccessToken();
    };
    const id = window.setInterval(tick, REFRESH_INTERVAL_MS);
    const onFocus = () => {
      void ensureFreshAccessToken();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [ensureFreshAccessToken]);

  const signOut = useCallback(() => {
    clearAuthCookies();
    setUser(null);
  }, []);

  const syncFromCookies = useCallback(() => {
    hydrateFromCookies();
  }, [hydrateFromCookies]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    await ensureFreshAccessToken();
    const token = getAccessTokenFromCookie();
    if (!token || isAccessTokenExpired(token)) return null;
    return token;
  }, [ensureFreshAccessToken]);

  const value = useMemo(
    () => ({
      user,
      isHydrated,
      signOut,
      syncFromCookies,
      getAccessToken,
    }),
    [user, isHydrated, signOut, syncFromCookies, getAccessToken],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}
