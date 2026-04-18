import { Link } from "react-router-dom";
import { TasklyLogo } from "../components/TasklyLogo";

export function LoginPage() {
  return (
    <div className="min-h-svh bg-background px-4 py-8">
      <header className="mx-auto max-w-lg">
        <TasklyLogo />
      </header>
      <main
        id="main-content"
        className="mx-auto mt-12 max-w-lg rounded-2xl bg-white px-6 py-10 text-center shadow-card"
      >
        <h1 className="text-headline-lg text-slate-dark">Log in</h1>
        <p className="mt-3 text-body-md text-slate-medium">
          Sign-in is not implemented in this build.
        </p>
        <p className="mt-6 text-body-md">
          <Link
            to="/signup"
            className="font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Create an account
          </Link>
        </p>
      </main>
    </div>
  );
}
