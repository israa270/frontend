import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { loginWithPassword } from "../api/login";
import { useAuthSession } from "../hooks/useAuthSession";
import { TasklyLogo } from "../components/TasklyLogo";
import {
  getRefreshTokenFromCookie,
  persistAuthCookies,
} from "../lib/authCookies";
import { type LoginFormValues, loginFormSchema } from "../schemas/loginSchema";

const inputBaseClass =
  "w-full rounded-lg border-0 bg-[#E8EFFF] px-4 py-3 text-body-md text-slate-dark shadow-none placeholder:text-slate-light focus:outline-none focus:ring-2 focus:ring-primary/35";

function fieldErrorRing(hasError: boolean): string {
  return hasError ? "ring-2 ring-error focus:ring-error" : "";
}

export function LoginPage() {
  const navigate = useNavigate();
  const { user, isHydrated, syncFromCookies } = useAuthSession();
  const [rootError, setRootError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setRootError(null);
    try {
      const result = await loginWithPassword({
        email: values.email,
        password: values.password,
      });
      persistAuthCookies(
        {
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          user: result.user,
        },
        values.rememberMe,
      );
      syncFromCookies();
      navigate("/dashboard", { replace: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Login failed.";
      setRootError(message);
    }
  });

  if (isHydrated && user && getRefreshTokenFromCookie()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-svh bg-background px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-[1200px]">
        <header className="mb-8 sm:mb-10">
          <TasklyLogo />
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-[440px] rounded-2xl bg-white px-6 py-8 shadow-card sm:px-10 sm:py-10"
        >
          <div className="mb-8 text-center">
            <h1 className="text-headline-lg text-primary">Welcome Back</h1>
            <p className="mt-2 text-body-md text-slate-medium">
              Please enter your details to access your workspace
            </p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
            {rootError ? (
              <div
                role="alert"
                className="rounded-lg bg-surface-error px-4 py-3 text-sm text-error"
              >
                {rootError}
              </div>
            ) : null}

            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-label-sm text-slate-dark"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "login-email-err" : undefined}
                className={`${inputBaseClass} ${fieldErrorRing(!!errors.email)}`}
                placeholder="yourname@company.com"
                {...register("email")}
              />
              {errors.email ? (
                <p
                  id="login-email-err"
                  role="alert"
                  className="mt-1 text-sm text-error"
                >
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-label-sm text-slate-dark"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={
                  errors.password ? "login-password-err" : undefined
                }
                className={`${inputBaseClass} ${fieldErrorRing(!!errors.password)}`}
                placeholder="Enter your password"
                {...register("password")}
              />
              {errors.password ? (
                <p
                  id="login-password-err"
                  role="alert"
                  className="mt-1 text-sm text-error"
                >
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-body-md text-slate-medium">
                <input
                  type="checkbox"
                  className="size-4 rounded border-slate-light text-primary focus:ring-primary"
                  {...register("rememberMe", {
                    setValueAs: (v) => v === true || v === "on",
                  })}
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-body-md font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-primary-container py-3.5 text-center text-body-md font-semibold text-on-primary-container shadow-soft transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isSubmitting ? "Signing in…" : "Log In"}
            </button>
          </form>

          <p className="mt-6 text-center text-body-md text-slate-medium">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Sign up
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}
