import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuthSession } from "../../hooks/useAuthSession";
import { useAppDispatch } from "../../store/hooks";
import { fetchUserProfile } from "../../store/slices/userSlice";
import { AppNavbar } from "./AppNavbar";
import { AppSidebar } from "./AppSidebar";

const SIDEBAR_COLLAPSED_KEY = "taskly_sidebar_collapsed";
const LG_QUERY = "(min-width: 1024px)";

function useIsLargeScreen(): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(LG_QUERY).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(LG_QUERY);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return matches;
}

export function AppShell() {
  const dispatch = useAppDispatch();
  const { getAccessToken } = useAuthSession();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLarge = useIsLargeScreen();
  const sidebarCollapsed = isLarge ? collapsed : false;

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getAccessToken();
      if (!token || cancelled) return;
      await dispatch(fetchUserProfile(token));
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, getAccessToken]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="flex min-h-svh w-full bg-background">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-dark/40 lg:hidden"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-surface-highest bg-surface-low transition-[transform,width] duration-200 ease-out",
          "w-64 max-w-[85vw]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:z-0 lg:max-w-none lg:translate-x-0 lg:shrink-0",
          collapsed ? "lg:w-[4.5rem]" : "lg:w-56",
        ].join(" ")}
      >
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          onNavigate={closeMobile}
          showCollapseControl={isLarge}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppNavbar onMenuClick={() => setMobileOpen(true)} />
        <main
          id="main-content"
          className="min-h-0 flex-1 overflow-auto bg-white p-4 sm:p-6 lg:p-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
