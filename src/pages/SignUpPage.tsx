import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { signUpWithPassword } from "../api/signup";
import { PasswordRequirements } from "../components/PasswordRequirements";
import { TasklyLogo } from "../components/TasklyLogo";
import {
  type SignUpFormValues,
  signUpFormSchema,
} from "../schemas/signUpSchema";

const inputBaseClass =
  "w-full rounded-lg border-0 bg-[#E8EFFF] px-4 py-3 text-body-md text-slate-dark shadow-none placeholder:text-slate-light focus:outline-none focus:ring-2 focus:ring-primary/35";

function fieldErrorRing(hasError: boolean): string {
  return hasError ? "ring-2 ring-error focus:ring-error" : "";
}

export function SignUpPage() {
  const navigate = useNavigate();
  const [rootError, setRootError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      jobTitle: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const onSubmit = handleSubmit(async (values) => {
    setRootError(null);
    try {
      const job = values.jobTitle.trim();
      await signUpWithPassword({
        email: values.email.trim(),
        password: values.password,
        data: {
          name: values.name.trim(),
          ...(job.length > 0 ? { job_title: job } : {}),
        },
      });
      navigate("/", { replace: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Sign up failed.";
      setRootError(message);
    }
  });

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
            <h1 className="text-headline-lg text-primary">
              Create your workspace
            </h1>
            <p className="mt-2 text-body-md text-slate-medium">
              Join the editorial approach to task management.
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
                htmlFor="signup-name"
                className="mb-1.5 block text-label-sm text-slate-medium"
              >
                Name
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={
                  errors.name
                    ? "signup-name-hint signup-name-err"
                    : "signup-name-hint"
                }
                className={`${inputBaseClass} ${fieldErrorRing(!!errors.name)}`}
                placeholder="Enter your full name"
                {...register("name")}
              />
              <p
                id="signup-name-hint"
                className="mt-1.5 text-xs text-slate-light"
              >
                3–50 characters, letters only (any language), single spaces
                between names.
              </p>
              {errors.name ? (
                <p
                  id="signup-name-err"
                  role="alert"
                  className="mt-1 text-sm text-error"
                >
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="mb-1.5 block text-label-sm text-slate-medium"
              >
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "signup-email-err" : undefined}
                className={`${inputBaseClass} ${fieldErrorRing(!!errors.email)}`}
                placeholder="yourname@company.com"
                {...register("email")}
              />
              {errors.email ? (
                <p
                  id="signup-email-err"
                  role="alert"
                  className="mt-1 text-sm text-error"
                >
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="signup-job"
                className="mb-1.5 block text-label-sm text-slate-medium"
              >
                Job title{" "}
                <span className="font-normal normal-case text-slate-light">
                  (optional)
                </span>
              </label>
              <input
                id="signup-job"
                type="text"
                autoComplete="organization-title"
                aria-invalid={errors.jobTitle ? true : undefined}
                aria-describedby={
                  errors.jobTitle ? "signup-job-err" : undefined
                }
                className={`${inputBaseClass} ${fieldErrorRing(!!errors.jobTitle)}`}
                placeholder="e.g. Project Manager"
                {...register("jobTitle")}
              />
              {errors.jobTitle ? (
                <p
                  id="signup-job-err"
                  role="alert"
                  className="mt-1 text-sm text-error"
                >
                  {errors.jobTitle.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label
                  htmlFor="signup-password"
                  className="mb-1.5 block text-label-sm text-slate-medium"
                >
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={[
                    "signup-password-rules",
                    errors.password ? "signup-password-err" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  className={`${inputBaseClass} ${fieldErrorRing(!!errors.password)}`}
                  placeholder="Minimum 8 characters"
                  {...register("password")}
                />
                {errors.password ? (
                  <p
                    id="signup-password-err"
                    role="alert"
                    className="mt-1 text-sm text-error"
                  >
                    {errors.password.message}
                  </p>
                ) : null}
              </div>
              <div className="sm:col-span-1">
                <label
                  htmlFor="signup-confirm"
                  className="mb-1.5 block text-label-sm text-slate-medium"
                >
                  Confirm password
                </label>
                <input
                  id="signup-confirm"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={errors.confirmPassword ? true : undefined}
                  aria-describedby={
                    errors.confirmPassword ? "signup-confirm-err" : undefined
                  }
                  className={`${inputBaseClass} ${fieldErrorRing(!!errors.confirmPassword)}`}
                  placeholder="Repeat your password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword ? (
                  <p
                    id="signup-confirm-err"
                    role="alert"
                    className="mt-1 text-sm text-error"
                  >
                    {errors.confirmPassword.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div id="signup-password-rules">
              <PasswordRequirements password={passwordValue} />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-primary-container py-3.5 text-center text-body-md font-semibold text-on-primary-container shadow-soft transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isSubmitting ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-body-md text-slate-medium">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Log in
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}
