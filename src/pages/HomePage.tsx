import { Link } from "react-router-dom";
import { TasklyLogo } from "../components/TasklyLogo";

export function HomePage() {
  return (
    <div className="min-h-svh bg-background px-4 py-8">
      <header className="mx-auto flex max-w-3xl items-center justify-between">
        <TasklyLogo />
        <Link
          to="/signup"
          className="rounded-lg bg-primary-container px-4 py-2.5 text-sm font-semibold text-on-primary-container no-underline shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Sign up
        </Link>
      </header>
      <main id="main-content" className="mx-auto mt-16 max-w-3xl text-center">
        <h1 className="text-display-lg text-slate-dark">Welcome to TASKLY</h1>
        <p className="mt-4 text-body-md text-slate-medium">
          You are on the home page. Create an account to get started.
        </p>
      </main>
    </div>
  );
}
