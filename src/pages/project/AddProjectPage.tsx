import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { createProject } from "../../api/createProject";
import { useAuthSession } from "../../hooks/useAuthSession";
import {
  type AddProjectFormValues,
  addProjectFormSchema,
} from "../../schemas/addProjectSchema";

const inputBaseClass =
  "w-full rounded-lg border-0 bg-[#E8EFFF] px-4 py-3 text-body-md text-slate-dark shadow-none placeholder:text-slate-light focus:outline-none focus:ring-2 focus:ring-primary/35";

function fieldErrorRing(hasError: boolean): string {
  return hasError ? "ring-2 ring-error focus:ring-error" : "";
}

const TOAST_MS = 4500;

export function AddProjectPage() {
  const navigate = useNavigate();
  const { getAccessToken } = useAuthSession();
  const [apiError, setApiError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const dismissToast = useCallback(() => setSuccessToast(null), []);

  useEffect(() => {
    if (!successToast) return;
    const id = window.setTimeout(dismissToast, TOAST_MS);
    return () => window.clearTimeout(id);
  }, [successToast, dismissToast]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddProjectFormValues>({
    resolver: zodResolver(addProjectFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const descriptionValue = useWatch({
    control,
    name: "description",
    defaultValue: "",
  });
  const descriptionLength = descriptionValue?.length ?? 0;

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setApiError(
          "Failed to create project: You are not signed in. Please log in again.",
        );
        return;
      }
      await createProject(token, {
        name: values.name,
        description: values.description,
      });
      reset({ name: "", description: "" });
      setSuccessToast("Project created successfully.");
    } catch (e) {
      const detail = e instanceof Error ? e.message : "Unknown error.";
      setApiError(`Failed to create project: ${detail}`);
    }
  });

  return (
    <div className="mx-auto w-full max-w-3xl">
      {successToast ? (
        <div
          role="status"
          className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:max-w-md"
        >
          <div className="flex items-center gap-3 rounded-xl border border-surface-highest bg-white px-4 py-3 shadow-card">
            <span
              className="icon-material shrink-0 text-2xl text-success"
              aria-hidden
            >
              check_circle
            </span>
            <p className="text-sm font-medium text-slate-dark">
              {successToast}
            </p>
            <button
              type="button"
              onClick={dismissToast}
              className="ml-auto shrink-0 rounded-lg p-1 text-slate-medium hover:bg-surface-low hover:text-slate-dark"
              aria-label="Dismiss notification"
            >
              <span className="icon-material text-xl" aria-hidden>
                close
              </span>
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <nav
            className="mb-2 text-label-sm font-semibold uppercase tracking-wide text-slate-medium"
            aria-label="Breadcrumb"
          >
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link
                  to="/project"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Projects
                </Link>
              </li>
              <li aria-hidden className="text-slate-light">
                /
              </li>
              <li className="text-slate-dark">Add new project</li>
            </ol>
          </nav>
          <h1 className="text-headline-lg text-primary">Add New Project</h1>
        </div>
        <Link
          to="/dashboard/members"
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-primary-container px-4 py-2.5 text-center text-sm font-semibold text-on-primary-container shadow-soft transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:self-auto"
        >
          <span className="icon-material text-[20px]" aria-hidden>
            person_add
          </span>
          Invite Member
        </Link>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-5 shadow-card sm:p-8">
        <div className="mb-8 flex gap-4 border-b border-surface-highest pb-6">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface-low text-primary"
            aria-hidden
          >
            <span className="icon-material text-3xl">assignment_add</span>
          </div>
          <div className="min-w-0">
            <h2 className="text-title-md text-slate-dark">
              Initialize New Project
            </h2>
            <p className="mt-1 text-body-md text-slate-medium">
              Define the scope and foundational details of your project.
            </p>
          </div>
        </div>

        <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
          {apiError ? (
            <div
              role="alert"
              className="rounded-lg bg-surface-error px-4 py-3 text-sm text-error"
            >
              {apiError}
            </div>
          ) : null}

          <div>
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
              <label
                htmlFor="project-name"
                className="text-label-sm font-semibold uppercase tracking-wide text-slate-dark"
              >
                Project title <span className="text-error">*</span>
              </label>
            </div>
            <input
              id="project-name"
              type="text"
              autoComplete="off"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "project-name-err" : undefined}
              className={`${inputBaseClass} ${fieldErrorRing(!!errors.name)}`}
              placeholder="e.g. Website redesign"
              {...register("name")}
            />
            {errors.name ? (
              <p
                id="project-name-err"
                role="alert"
                className="mt-1.5 flex items-start gap-1.5 text-sm text-error"
              >
                <span className="icon-material shrink-0 text-base" aria-hidden>
                  warning
                </span>
                {errors.name.message}
              </p>
            ) : null}
          </div>

          <div>
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
              <label
                htmlFor="project-description"
                className="text-label-sm font-semibold uppercase tracking-wide text-slate-dark"
              >
                Description
              </label>
              <span className="text-label-sm font-medium uppercase tracking-wide text-slate-light">
                Optional
              </span>
            </div>
            <textarea
              id="project-description"
              rows={5}
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={
                errors.description
                  ? "project-description-err project-description-counter"
                  : "project-description-counter"
              }
              className={`min-h-[8rem] resize-y ${inputBaseClass} ${fieldErrorRing(!!errors.description)}`}
              placeholder="Provide a high-level overview of the project's architectural objectives and key milestones…"
              {...register("description")}
            />
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
              {errors.description ? (
                <p
                  id="project-description-err"
                  role="alert"
                  className="text-sm text-error"
                >
                  {errors.description.message}
                </p>
              ) : (
                <span />
              )}
              <p
                id="project-description-counter"
                className={`text-xs font-medium tabular-nums ${descriptionLength > 500 ? "text-error" : "text-slate-medium"}`}
              >
                {descriptionLength} / 500 characters
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/project")}
              className="rounded-lg px-5 py-3 text-center text-body-md font-semibold text-primary hover:bg-surface-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary-container px-6 py-3 text-center text-body-md font-semibold text-on-primary-container shadow-soft transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isSubmitting ? "Creating…" : "Create Project"}
            </button>
          </div>
        </form>

        <div className="mt-8 flex gap-3 rounded-xl bg-surface-low px-4 py-3 text-body-md text-slate-dark sm:items-start">
          <span className="icon-material shrink-0 text-2xl text-primary-container">
            lightbulb
          </span>
          <p>
            <span className="font-semibold text-primary">Pro tip:</span> You can
            invite project members and assign epics immediately after the
            initial creation process.
          </p>
        </div>
      </div>
    </div>
  );
}
