import { Link, useNavigate } from "react-router-dom";
import { useAuthSession } from "../hooks/useAuthSession";
import { TasklyLogo } from "../components/TasklyLogo";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthSession();

  return (
    <div className="min-h-svh bg-background px-4 py-8">
      <header className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4">
        <TasklyLogo />
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-sm font-medium text-slate-medium underline-offset-2 hover:text-primary hover:underline"
          >
            Home
          </Link>
          <button
            type="button"
            onClick={() => {
              signOut();
              navigate("/login", { replace: true });
            }}
            className="rounded-lg border border-slate-light bg-white px-4 py-2 text-sm font-semibold text-slate-dark hover:bg-surface-low"
          >
            Log out
          </button>
        </div>
      </header>
      <main id="main-content" className="mx-auto mt-12 max-w-3xl">
        <h1 className="text-headline-lg text-slate-dark">Dashboard</h1>
        <p className="mt-3 text-body-md text-slate-medium">
          Signed in as{" "}
          <span className="font-semibold text-slate-dark">
            {user?.email ?? user?.id}
          </span>
        </p>
      </main>
    </div>
  );
}
