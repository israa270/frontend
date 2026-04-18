import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storeRecoveryTokens } from "../lib/recoveryStorage";

function parseRecoveryFromLocation(): {
  access: string;
  refresh: string | undefined;
} | null {
  const hash = window.location.hash.replace(/^#/, "");
  const fromHash = new URLSearchParams(hash);
  let type = fromHash.get("type");
  let access = fromHash.get("access_token");
  let refresh = fromHash.get("refresh_token") ?? undefined;

  if (type !== "recovery" || !access) {
    const q = new URLSearchParams(window.location.search);
    type = q.get("type");
    access = q.get("access_token");
    refresh = q.get("refresh_token") ?? undefined;
  }

  if (type !== "recovery" || !access) return null;
  return { access, refresh };
}

/** Sends Supabase recovery hash/query to `/reset-password` and clears the fragment. */
export function RecoveryHashRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = () => {
      const parsed = parseRecoveryFromLocation();
      if (!parsed) return;
      storeRecoveryTokens(parsed.access, parsed.refresh);
      navigate("/reset-password", {
        replace: true,
        state: {
          recoveryAccessToken: parsed.access,
          recoveryRefreshToken: parsed.refresh,
        },
      });
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    };

    redirect();
    window.addEventListener("hashchange", redirect);
    return () => window.removeEventListener("hashchange", redirect);
  }, [navigate]);

  return null;
}
