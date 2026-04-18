import { useAuthSession } from "../../hooks/useAuthSession";
import {
  displayNameFromAuthUser,
  initialsFromDisplayName,
  jobTitleFromAuthUser,
} from "../../lib/userDisplay";
import { useAppSelector } from "../../store/hooks";
import { selectUserProfile } from "../../store/selectors";

type AppNavbarProps = {
  onMenuClick: () => void;
};

export function AppNavbar({ onMenuClick }: AppNavbarProps) {
  const { user: cookieUser } = useAuthSession();
  const profile = useAppSelector(selectUserProfile);

  const name = displayNameFromAuthUser(profile, cookieUser);
  const jobTitle = jobTitleFromAuthUser(profile, cookieUser);
  const initials = initialsFromDisplayName(name);

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
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold uppercase text-on-primary sm:size-11 sm:text-base"
            aria-hidden
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
