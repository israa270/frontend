import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createEpic } from "../../api/createEpic";
import { fetchProjectById } from "../../api/fetchProjectById";
import { fetchProjectMembers, type ProjectMember } from "../../api/fetchProjectMembers";
import { HttpError } from "../../api/httpError";
import { useAuthSession } from "../../hooks/useAuthSession";
import { type AddEpicFormValues, addEpicFormSchema } from "../../schemas/addEpicSchema";

const inputBaseClass =
  "w-full rounded-lg border-0 bg-[#E8EFFF] px-4 py-3 text-body-md text-slate-dark shadow-none placeholder:text-slate-light focus:outline-none focus:ring-2 focus:ring-primary/35";

function fieldErrorRing(hasError: boolean): string {
  return hasError ? "ring-2 ring-error focus:ring-error" : "";
}

const TOAST_MS = 4500;

function todayInputValue(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function AddEpicPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { getAccessToken, signOut } = useAuthSession();
  const [projectName, setProjectName] = useState("Project");
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [bootLoading, setBootLoading] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const minDeadline = useMemo(() => todayInputValue(), []);

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
  } = useForm<AddEpicFormValues>({
    resolver: zodResolver(addEpicFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      assigneeId: "",
      deadline: "",
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
      setBootError("Project not found.");
      setBootLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      setBootLoading(true);
      setBootError(null);
      try {
        const token = await getAccessToken();
        if (!token) {
          throw new HttpError("Unauthorized", 401);
        }
        const [project, projectMembers] = await Promise.all([
          fetchProjectById(token, projectId),
          fetchProjectMembers(token, projectId),
        ]);
        if (cancelled) return;
        setProjectName(project.name);
        setMembers(projectMembers);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof HttpError && error.status === 401) {
          signOut();
          navigate("/login", { replace: true });
          return;
        }
        setBootError("Failed to load create epic form. Please try again.");
      } finally {
        if (!cancelled) setBootLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, getAccessToken, signOut, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    if (!projectId) return;
    try {
      const token = await getAccessToken();
      if (!token) {
        setApiError("Failed to create epic: You are not signed in.");
        return;
      }
      await createEpic(token, {
        title: values.title,
        description: values.description,
        assigneeId: values.assigneeId || null,
        projectId,
        deadline: values.deadline || null,
      });
      reset({
        title: "",
        description: "",
        assigneeId: "",
        deadline: "",
      });
      setSuccessToast("Epic created successfully.");
      navigate(`/project/${encodeURIComponent(projectId)}/epics`);
    } catch (e) {
      if (e instanceof HttpError && e.status === 401) {
        signOut();
        navigate("/login", { replace: true });
        return;
      }
      const detail = e instanceof Error ? e.message : "Unknown error.";
      setApiError(`Failed to create epic: ${detail}`);
    }
  });

  return (
    <div className="mx-auto w-full max-w-4xl">
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

      <div className="mb-6">
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
            <li className="text-slate-dark">{projectName}</li>
            <li aria-hidden className="text-slate-light">
              /
            </li>
            <li>
              <Link
                to={projectId ? `/project/${encodeURIComponent(projectId)}/epics` : "/project"}
                className="text-primary underline-offset-2 hover:underline"
              >
                Epics
              </Link>
            </li>
            <li aria-hidden className="text-slate-light">
              /
            </li>
            <li className="text-slate-dark">New Epic</li>
          </ol>
        </nav>
        <h1 className="text-headline-lg text-slate-dark">Create New Epic</h1>
        <p className="mt-1 text-body-md text-slate-medium">
          Define a major project phase or high-level milestone.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-card sm:p-8">
        {bootLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-11 w-full rounded bg-surface-highest" />
            <div className="h-28 w-full rounded bg-surface-highest" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-11 rounded bg-surface-highest" />
              <div className="h-11 rounded bg-surface-highest" />
            </div>
          </div>
        ) : bootError ? (
          <div
            role="alert"
            className="rounded-lg bg-surface-error px-4 py-3 text-sm text-error"
          >
            {bootError}
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
              <label
                htmlFor="epic-title"
                className="mb-1.5 block text-label-sm font-semibold uppercase tracking-wide text-slate-dark"
              >
                Title <span className="text-error">*</span>
              </label>
              <input
                id="epic-title"
                type="text"
                autoComplete="off"
                aria-invalid={errors.title ? true : undefined}
                aria-describedby={errors.title ? "epic-title-err" : undefined}
                className={`${inputBaseClass} ${fieldErrorRing(!!errors.title)}`}
                placeholder="e.g. Structural Foundation Phase"
                {...register("title")}
              />
              {errors.title ? (
                <p id="epic-title-err" role="alert" className="mt-1.5 text-sm text-error">
                  {errors.title.message}
                </p>
              ) : null}
            </div>

            <div>
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <label
                  htmlFor="epic-description"
                  className="text-label-sm font-semibold uppercase tracking-wide text-slate-dark"
                >
                  Description
                </label>
                <span className="text-label-sm font-medium uppercase tracking-wide text-slate-light">
                  Optional
                </span>
              </div>
              <textarea
                id="epic-description"
                rows={5}
                aria-invalid={errors.description ? true : undefined}
                aria-describedby={
                  errors.description
                    ? "epic-description-err epic-description-counter"
                    : "epic-description-counter"
                }
                className={`min-h-[8rem] resize-y ${inputBaseClass} ${fieldErrorRing(!!errors.description)}`}
                placeholder="Describe the scope and objectives of this epic…"
                {...register("description")}
              />
              <div className="mt-1.5 flex items-center justify-between gap-2">
                {errors.description ? (
                  <p id="epic-description-err" role="alert" className="text-sm text-error">
                    {errors.description.message}
                  </p>
                ) : (
                  <span />
                )}
                <p
                  id="epic-description-counter"
                  className={`text-xs font-medium tabular-nums ${descriptionLength > 500 ? "text-error" : "text-slate-medium"}`}
                >
                  {descriptionLength} / 500 characters
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="epic-assignee"
                  className="mb-1.5 block text-label-sm font-semibold uppercase tracking-wide text-slate-dark"
                >
                  Assignee
                </label>
                <select
                  id="epic-assignee"
                  aria-invalid={errors.assigneeId ? true : undefined}
                  aria-describedby={errors.assigneeId ? "epic-assignee-err" : undefined}
                  className={`${inputBaseClass} ${fieldErrorRing(!!errors.assigneeId)}`}
                  {...register("assigneeId")}
                >
                  <option value="">Select a member...</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                {errors.assigneeId ? (
                  <p id="epic-assignee-err" role="alert" className="mt-1.5 text-sm text-error">
                    {errors.assigneeId.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="epic-deadline"
                  className="mb-1.5 block text-label-sm font-semibold uppercase tracking-wide text-slate-dark"
                >
                  Deadline
                </label>
                <input
                  id="epic-deadline"
                  type="date"
                  min={minDeadline}
                  aria-invalid={errors.deadline ? true : undefined}
                  aria-describedby={errors.deadline ? "epic-deadline-err" : undefined}
                  className={`${inputBaseClass} ${fieldErrorRing(!!errors.deadline)}`}
                  {...register("deadline")}
                />
                {errors.deadline ? (
                  <p id="epic-deadline-err" role="alert" className="mt-1.5 text-sm text-error">
                    {errors.deadline.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    projectId
                      ? `/project/${encodeURIComponent(projectId)}/epics`
                      : "/project",
                  )
                }
                className="rounded-lg px-5 py-3 text-center text-body-md font-semibold text-primary hover:bg-surface-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-primary-container px-6 py-3 text-center text-body-md font-semibold text-on-primary-container shadow-soft transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isSubmitting ? "Creating..." : "Create Epic"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
