import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { updateUserPassword } from "../api/updateUserPassword";
import { PasswordRequirementChecklist } from "../components/PasswordRequirementChecklist";
import { TasklyLogo } from "../components/TasklyLogo";
import { clearRecoveryTokens } from "../lib/recoveryStorage";
import {
  type ResetPasswordFormValues,
  resetPasswordFormSchema,
} from "../schemas/resetPasswordFormSchema";

const inputBaseClass =
  "w-full rounded-lg border-0 bg-[#E8EFFF] px-4 py-3 text-body-md text-slate-dark shadow-none placeholder:text-slate-light focus:outline-none focus:ring-2 focus:ring-primary/35";

function fieldErrorRing(hasError: boolean): string {
  return hasError ? "ring-2 ring-error focus:ring-error" : "";
}

type RecoveryLocationState = {
  recoveryAccessToken?: string;
  recoveryRefreshToken?: string;
};

function readRecoveryAccessToken(
  state: RecoveryLocationState | null,
): string | null {
  const fromState = state?.recoveryAccessToken;
  if (typeof fromState === "string" && fromState.length > 0) {
    return fromState;
  }
  if (typeof sessionStorage !== "undefined") {
    const fromStore = sessionStorage.getItem("taskly_recovery_access");
    if (fromStore && fromStore.length > 0) return fromStore;
  }
  return null;
}

export function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as RecoveryLocationState | null;

  const resolvedToken = readRecoveryAccessToken(state);

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  useEffect(() => {
    if (!doneMessage) return;
    const t = window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, 3000);
    return () => window.clearTimeout(t);
  }, [doneMessage, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    if (!resolvedToken) return;
    setRootError(null);
    try {
      await updateUserPassword(resolvedToken, values.password);
      clearRecoveryTokens();
      setDoneMessage(
        "Your password has been updated successfully. You can now log in.",
      );
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not update password.";
      setRootError(message);
    }
  });

  const invalidLink = !resolvedToken || resolvedToken.length === 0;

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
          {invalidLink ? (
            <div className="text-center">
              <h1 className="text-headline-lg text-slate-dark">
                Reset password
              </h1>
              <p className="mt-4 text-body-md text-error" role="alert">
                Invalid or expired reset link.
              </p>
              <p className="mt-6">
                <Link
                  to="/forgot-password"
                  className="font-semibold text-primary underline-offset-2 hover:underline"
                >
                  Request a new link
                </Link>
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-headline-lg text-slate-dark">
                  Create a New Password
                </h1>
                <p className="mt-2 text-body-md text-slate-medium">
                  Create a new, strong password to secure your workstation
                  access.
                </p>
              </div>

              {doneMessage ? (
                <div
                  role="status"
                  className="rounded-lg bg-green-50 px-4 py-3 text-center text-sm text-green-800"
                >
                  {doneMessage}
                  <p className="mt-2 text-xs text-slate-medium">
                    Redirecting to sign in…
                  </p>
                </div>
              ) : (
                <form
                  className="flex flex-col gap-6"
                  onSubmit={onSubmit}
                  noValidate
                >
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
                      htmlFor="reset-password"
                      className="mb-1.5 block text-label-sm uppercase text-slate-medium"
                    >
                      New password
                    </label>
                    <div className="relative">
                      <input
                        id="reset-password"
                        type={showPw ? "text" : "password"}
                        autoComplete="new-password"
                        aria-invalid={errors.password ? true : undefined}
                        aria-describedby={[
                          "reset-pw-rules",
                          errors.password ? "reset-password-err" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        className={`${inputBaseClass} pr-12 ${fieldErrorRing(!!errors.password)}`}
                        {...register("password")}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-medium hover:text-slate-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                        onClick={() => setShowPw((v) => !v)}
                        aria-label={
                          showPw ? "Hide new password" : "Show new password"
                        }
                      >
                        <span className="icon-material text-xl" aria-hidden>
                          {showPw ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    {errors.password ? (
                      <p
                        id="reset-password-err"
                        role="alert"
                        className="mt-1 text-sm text-error"
                      >
                        {errors.password.message}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="reset-confirm"
                      className="mb-1.5 block text-label-sm uppercase text-slate-medium"
                    >
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        id="reset-confirm"
                        type={showPw2 ? "text" : "password"}
                        autoComplete="new-password"
                        aria-invalid={errors.confirmPassword ? true : undefined}
                        aria-describedby={
                          errors.confirmPassword
                            ? "reset-confirm-err"
                            : undefined
                        }
                        className={`${inputBaseClass} pr-12 ${fieldErrorRing(!!errors.confirmPassword)}`}
                        {...register("confirmPassword")}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-medium hover:text-slate-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                        onClick={() => setShowPw2((v) => !v)}
                        aria-label={
                          showPw2
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        <span className="icon-material text-xl" aria-hidden>
                          {showPw2 ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                    {errors.confirmPassword ? (
                      <p
                        id="reset-confirm-err"
                        role="alert"
                        className="mt-1 text-sm text-error"
                      >
                        {errors.confirmPassword.message}
                      </p>
                    ) : null}
                  </div>

                  <div
                    id="reset-pw-rules"
                    className="rounded-lg bg-surface-low px-4 py-3"
                  >
                    <p className="mb-3 text-label-sm font-semibold uppercase tracking-wide text-slate-medium">
                      Security requirements
                    </p>
                    <PasswordRequirementChecklist password={passwordValue} />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-primary-container py-3.5 text-center text-body-md font-semibold text-on-primary-container shadow-soft transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {isSubmitting ? "Updating…" : "Update Password"}
                  </button>
                </form>
              )}

              {!doneMessage ? (
                <p className="mt-8 text-center">
                  <Link
                    to="/login"
                    className="text-body-md font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Back to sign in
                  </Link>
                </p>
              ) : null}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
