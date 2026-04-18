import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "../../hooks/useAuthSession";
import { runFullLogout } from "../../lib/runFullLogout";
import {
  displayNameFromAuthUser,
  initialsFromDisplayName,
  jobTitleFromAuthUser,
} from "../../lib/userDisplay";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectUserProfile } from "../../store/selectors";

type AppNavbarProps = {
  onMenuClick: () => void;
};

export function AppNavbar({ onMenuClick }: AppNavbarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user: cookieUser, getAccessToken, signOut } = useAuthSession();
  const profile = useAppSelector(selectUserProfile);

  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  const name = displayNameFromAuthUser(profile, cookieUser);
  const jobTitle = jobTitleFromAuthUser(profile, cookieUser);
  const initials = initialsFromDisplayName(name);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (
        menuWrapRef.current &&
        !menuWrapRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const handleLogoutClick = () => {
    if (logoutBusy) return;
    setLogoutBusy(true);
    void runFullLogout({
      getAccessToken,
      dispatch,
      signOut,
      navigate,
    }).finally(() => {
      setLogoutBusy(false);
    });
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-14 shrink-0 items-center gap-3 border-b border-slate-light bg-white px-3 sm:px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-dark hover:bg-surface-low lg:hidden"
        aria-label="Open menu"
      >
        <span className="icon-material text-2xl" aria-hidden>
          menu
        </span>
      </button>

      <div className="flex min-w-0 flex-1 justify-end">
        <div className="flex max-w-full min-w-0 items-center gap-2 sm:gap-3">
          <div className="min-w-0 text-right">
            <p className="truncate text-sm font-bold text-slate-dark sm:text-base">
              {name}
            </p>
            {jobTitle ? (
              <p className="truncate text-label-sm font-semibold uppercase tracking-wide text-primary-container">
                {jobTitle}
              </p>
            ) : (
              <p className="truncate text-label-sm uppercase tracking-wide text-slate-light">
                —
              </p>
            )}
          </div>
          <div className="relative shrink-0" ref={menuWrapRef}>
            <button
              type="button"
              id="navbar-user-menu-button"
              aria-label="Account menu"
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-controls="navbar-user-menu"
              disabled={logoutBusy}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex size-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold uppercase text-on-primary sm:size-11 sm:text-base enabled:hover:opacity-95 enabled:focus-visible:outline enabled:focus-visible:outline-2 enabled:focus-visible:outline-offset-2 enabled:focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {initials}
            </button>
            {menuOpen ? (
              <div
                id="navbar-user-menu"
                role="menu"
                aria-labelledby="navbar-user-menu-button"
                className="absolute right-0 top-full z-40 mt-1 min-w-[11rem] rounded-lg border border-surface-highest bg-white py-1 shadow-card"
              >
                <button
                  type="button"
                  role="menuitem"
                  disabled={logoutBusy}
                  onClick={handleLogoutClick}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-error hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="icon-material text-[20px]" aria-hidden>
                    logout
                  </span>
                  {logoutBusy ? "Logging out…" : "Log out"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
