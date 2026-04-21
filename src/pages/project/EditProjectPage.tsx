import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { HttpError } from "../../api/httpError";
import { fetchProjectById } from "../../api/fetchProjectById";
import { updateProject } from "../../api/updateProject";
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

export function EditProjectPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { getAccessToken, signOut } = useAuthSession();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
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

  useEffect(() => {
    if (!projectId) {
      setLoadError("Project not found.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const token = await getAccessToken();
        if (!token) {
          setLoadError("You are not signed in. Please log in again.");
          setLoading(false);
          return;
        }
        const project = await fetchProjectById(token, projectId);
        if (cancelled) return;
        reset({
          name: project.name,
          description: project.description ?? "",
        });
      } catch (error) {
        if (cancelled) return;
        if (error instanceof HttpError && error.status === 401) {
          signOut();
          navigate("/login", { replace: true });
          return;
        }
        setLoadError(
          error instanceof Error ? error.message : "Failed to load project details.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId, getAccessToken, reset, signOut, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    if (!projectId) return;
    try {
      const token = await getAccessToken();
      if (!token) {
        setApiError("Failed to update project: You are not signed in.");
        return;
      }
      await updateProject(token, projectId, {
        name: values.name,
        description: values.description,
      });
      setSuccessToast("Project updated successfully.");
    } catch (e) {
      if (e instanceof HttpError && e.status === 401) {
        signOut();
        navigate("/login", { replace: true });
        return;
      }
      const detail = e instanceof Error ? e.message : "Unknown error.";
      setApiError(`Failed to update project: ${detail}`);
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
            <p className="text-sm font-medium text-slate-dark">{successToast}</p>
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
            <li className="text-slate-dark">Edit project</li>
          </ol>
        </nav>
        <h1 className="text-headline-lg text-primary">Edit Project</h1>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-5 shadow-card sm:p-8">
        {loading ? (
          <p className="text-body-md text-slate-medium">Loading project details...</p>
        ) : loadError ? (
          <div
            role="alert"
            className="rounded-lg bg-surface-error px-4 py-3 text-sm text-error"
          >
            {loadError}
          </div>
        ) : (
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
                {isSubmitting ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
