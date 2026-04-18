import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { requestPasswordRecovery } from "../api/recover";
import { TasklyLogo } from "../components/TasklyLogo";

const COOLDOWN_SEC = 5 * 60;
const MAX_SUCCESSFUL_SENDS = 3;

const forgotSchema = z.object({
  email: z.email("Enter a valid email address."),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

const inputBaseClass =
  "w-full rounded-lg border-0 bg-[#E8EFFF] px-4 py-3 text-body-md text-slate-dark shadow-none placeholder:text-slate-light focus:outline-none focus:ring-2 focus:ring-primary/35";

function fieldErrorRing(hasError: boolean): string {
  return hasError ? "ring-2 ring-error focus:ring-error" : "";
}

function formatMmSs(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const SUCCESS_COPY =
  "If an account exists with this email, we've sent a password reset link.";

export function ForgotPasswordPage() {
  const [rootError, setRootError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cooldownSec, setCooldownSec] = useState(0);
  const [successfulSends, setSuccessfulSends] = useState(0);
  const [savedEmail, setSavedEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { email: "" },
  });

  const remainingSends = MAX_SUCCESSFUL_SENDS - successfulSends;
  const resendAvailable =
    showSuccess &&
    cooldownSec === 0 &&
    remainingSends > 0 &&
    savedEmail.length > 0;

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const id = window.setInterval(() => {
      setCooldownSec((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldownSec]);

  const runRecover = useCallback(async (email: string) => {
    setRootError(null);
    await requestPasswordRecovery(email);
    setSuccessfulSends((n) => n + 1);
    setShowSuccess(true);
    setCooldownSec(COOLDOWN_SEC);
    setSavedEmail(email.trim());
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    if (successfulSends >= MAX_SUCCESSFUL_SENDS) return;
    try {
      await runRecover(values.email);
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Could not send reset link. Try again.";
      setRootError(message);
    }
  });

  const onResend = async () => {
    if (!resendAvailable || isResending) {
      return;
    }
    setIsResending(true);
    setRootError(null);
    try {
      await runRecover(savedEmail);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not resend. Try again later.";
      setRootError(message);
    } finally {
      setIsResending(false);
    }
  };

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
            <h1 className="text-headline-lg text-primary">Forgot password?</h1>
            <p className="mt-2 text-body-md text-slate-medium">
              No worries, we&apos;ll send you reset instructions.
            </p>
          </div>

          {rootError ? (
            <div
              role="alert"
              className="mb-6 rounded-lg bg-surface-error px-4 py-3 text-sm text-error"
            >
              {rootError}
            </div>
          ) : null}

          {showSuccess ? (
            <div
              role="status"
              className="mb-6 flex gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            >
              <span
                className="icon-material shrink-0 text-green-600"
                aria-hidden
              >
                check_circle
              </span>
              <span>{SUCCESS_COPY}</span>
            </div>
          ) : null}

          {!showSuccess ? (
            <form
              className="flex flex-col gap-6"
              onSubmit={onSubmit}
              noValidate
            >
              <div>
                <label
                  htmlFor="forgot-email"
                  className="mb-1.5 block text-label-sm text-slate-dark"
                >
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={
                    errors.email ? "forgot-email-err" : undefined
                  }
                  className={`${inputBaseClass} ${fieldErrorRing(!!errors.email)}`}
                  placeholder="Enter your email"
                  disabled={successfulSends >= MAX_SUCCESSFUL_SENDS}
                  {...register("email")}
                />
                {errors.email ? (
                  <p
                    id="forgot-email-err"
                    role="alert"
                    className="mt-1 text-sm text-error"
                  >
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting || successfulSends >= MAX_SUCCESSFUL_SENDS
                }
                className="w-full rounded-lg bg-primary py-3.5 text-center text-body-md font-semibold text-on-primary shadow-soft transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isSubmitting ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <div className="rounded-lg bg-surface-low px-4 py-3 text-center text-sm text-slate-dark">
              Sent to <span className="font-medium">{savedEmail}</span>
            </div>
          )}

          {showSuccess ? (
            <div className="mt-6 flex flex-col gap-3">
              <p className="text-center text-label-sm text-slate-medium">
                Don&apos;t receive an email? Resend
              </p>
              <button
                type="button"
                onClick={onResend}
                disabled={!resendAvailable || isResending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-highest px-4 py-3 text-body-md font-medium text-slate-medium transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="icon-material text-lg" aria-hidden>
                  schedule
                </span>
                {cooldownSec > 0
                  ? `Resend in ${formatMmSs(cooldownSec)}`
                  : remainingSends > 0
                    ? isResending
                      ? "Sending…"
                      : "Resend email"
                    : "No resends left"}
              </button>
              {successfulSends >= MAX_SUCCESSFUL_SENDS &&
              remainingSends <= 0 ? (
                <p className="text-center text-xs text-slate-light">
                  Maximum recovery attempts reached. Try again later or contact
                  support.
                </p>
              ) : null}
            </div>
          ) : null}

          <p className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-body-md font-semibold text-primary no-underline hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span aria-hidden>←</span> Back to log in
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}
