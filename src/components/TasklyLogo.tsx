import { Link } from "react-router-dom";

type TasklyLogoProps = {
  className?: string;
  /** Hide wordmark (sidebar collapsed). */
  compact?: boolean;
  to?: string;
};

export function TasklyLogo({
  className = "",
  compact = false,
  to = "/",
}: TasklyLogoProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2.5 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${compact ? "px-0" : ""} ${className}`}
      aria-label="TASKLY home"
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M18 2L31 10V26L18 34L5 26V10L18 2Z"
          stroke="#005CFC"
          strokeWidth="2"
          fill="#E8EFFF"
        />
        <path
          d="M13 18L16.5 21.5L23 15"
          stroke="#003F91"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {!compact ? (
        <span className="text-sm font-bold uppercase tracking-[0.12em] text-slate-dark">
          TASKLY
        </span>
      ) : null}
    </Link>
  );
}
