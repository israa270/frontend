import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchProjectEpicDetails, type ProjectEpicItem } from "../../api/fetchProjectEpics";
import { fetchProjectById } from "../../api/fetchProjectById";
import { fetchProjectMembers, type ProjectMember } from "../../api/fetchProjectMembers";
import { updateEpic } from "../../api/updateEpic";
import { HttpError } from "../../api/httpError";
import { useAuthSession } from "../../hooks/useAuthSession";
import { createEditEpicFormSchema, type EditEpicFormValues } from "../../schemas/editEpicSchema";

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

function dateInputFromIso(iso: string | null): string {
  if (!iso) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso.slice(0, 10);
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function memberIdForEpicAssignee(
  epic: ProjectEpicItem,
  members: ProjectMember[],
): string {
  if (epic.assigneeId) {
    if (members.some((m) => m.id === epic.assigneeId)) return epic.assigneeId;
  }
  if (!epic.assignee) return "";
  return (
    members.find(
      (m) =>
        (epic.assignee?.email && m.email && m.email === epic.assignee.email) ||
        m.name === epic.assignee?.name,
    )?.id ?? ""
  );
}

type EditInnerProps = {
  projectId: string;
  projectName: string;
  epic: ProjectEpicItem;
  members: ProjectMember[];
  getAccessToken: () => Promise<string | null | undefined>;
  signOut: () => void;
  navigate: ReturnType<typeof useNavigate>;
};

function EditEpicFormInner({
  projectId,
  projectName,
  epic,
  members,
  getAccessToken,
  signOut,
  navigate,
}: EditInnerProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const dismissToast = useCallback(() => setSuccessToast(null), []);

  const deadlineInput = useMemo(() => dateInputFromIso(epic.deadline), [epic.deadline]);
  const minDeadline = useMemo(() => {
    const t = todayInputValue();
    if (deadlineInput && deadlineInput < t) return deadlineInput;
    return t;
  }, [deadlineInput]);

  const formSchema = useMemo(
    () => createEditEpicFormSchema({ initialDeadlineInput: deadlineInput }),
    [deadlineInput],
  );

  const defaultAssigneeId = useMemo(
    () => memberIdForEpicAssignee(epic, members),
    [epic, members],
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EditEpicFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      title: epic.title,
      description: epic.description,
      assigneeId: defaultAssigneeId,
      deadline: deadlineInput,
    },
  });

  const descriptionValue = useWatch({
    control,
    name: "description",
    defaultValue: epic.description,
  });
  const descriptionLength = descriptionValue?.length ?? 0;

  useEffect(() => {
    if (!successToast) return;
    const id = window.setTimeout(dismissToast, TOAST_MS);
    return () => window.clearTimeout(id);
  }, [successToast, dismissToast]);

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setApiError("Failed to save: You are not signed in.");
        return;
      }
      await updateEpic(token, projectId, epic.id, {
        title: values.title,
        description: values.description,
        assigneeId: values.assigneeId || null,
        deadline: values.deadline || null,
      });
      setSuccessToast("Epic updated successfully.");
      navigate(`/project/${encodeURIComponent(projectId)}/epics`);
    } catch (e) {
      if (e instanceof HttpError && e.status === 401) {
        signOut();
        navigate("/login", { replace: true });
        return;
      }
      const detail = e instanceof Error ? e.message : "Unknown error.";
      setApiError(`Failed to save epic: ${detail}`);
    }
  });

  return (
    <>
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
                to={`/project/${encodeURIComponent(projectId)}/epics`}
                className="text-primary underline-offset-2 hover:underline"
              >
                Epics
              </Link>
            </li>
            <li aria-hidden className="text-slate-light">
              /
            </li>
            <li className="text-slate-dark">Edit</li>
          </ol>
        </nav>
        <h1 className="text-headline-lg text-slate-dark">Edit epic</h1>
        <p className="mt-1 text-body-md text-slate-medium">
          Update {epic.epicId ? <span className="font-mono text-slate-dark">{epic.epicId}</span> : "this epic"}
          {epic.title ? ` — ${epic.title}` : ""}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-card sm:p-8">
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
              htmlFor="edit-epic-title"
              className="mb-1.5 block text-label-sm font-semibold uppercase tracking-wide text-slate-dark"
            >
              Title <span className="text-error">*</span>
            </label>
            <input
              id="edit-epic-title"
              type="text"
              autoComplete="off"
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? "edit-epic-title-err" : undefined}
              className={`${inputBaseClass} ${fieldErrorRing(!!errors.title)}`}
              {...register("title")}
            />
            {errors.title ? (
              <p id="edit-epic-title-err" role="alert" className="mt-1.5 text-sm text-error">
                {errors.title.message}
              </p>
            ) : null}
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <label
                htmlFor="edit-epic-description"
                className="text-label-sm font-semibold uppercase tracking-wide text-slate-dark"
              >
                Description
              </label>
              <span className="text-label-sm font-medium uppercase tracking-wide text-slate-light">
                Optional
              </span>
            </div>
            <textarea
              id="edit-epic-description"
              rows={5}
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={
                errors.description
                  ? "edit-epic-description-err edit-epic-description-counter"
                  : "edit-epic-description-counter"
              }
              className={`min-h-[8rem] resize-y ${inputBaseClass} ${fieldErrorRing(!!errors.description)}`}
              {...register("description")}
            />
            <div className="mt-1.5 flex items-center justify-between gap-2">
              {errors.description ? (
                <p
                  id="edit-epic-description-err"
                  role="alert"
                  className="text-sm text-error"
                >
                  {errors.description.message}
                </p>
              ) : (
                <span />
              )}
              <p
                id="edit-epic-description-counter"
                className={`text-xs font-medium tabular-nums ${descriptionLength > 500 ? "text-error" : "text-slate-medium"}`}
              >
                {descriptionLength} / 500 characters
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-epic-assignee"
                className="mb-1.5 block text-label-sm font-semibold uppercase tracking-wide text-slate-dark"
              >
                Assignee
              </label>
              <select
                id="edit-epic-assignee"
                aria-invalid={errors.assigneeId ? true : undefined}
                aria-describedby={errors.assigneeId ? "edit-epic-assignee-err" : undefined}
                className={`${inputBaseClass} ${fieldErrorRing(!!errors.assigneeId)}`}
                {...register("assigneeId")}
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              {errors.assigneeId ? (
                <p
                  id="edit-epic-assignee-err"
                  role="alert"
                  className="mt-1.5 text-sm text-error"
                >
                  {errors.assigneeId.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="edit-epic-deadline"
                className="mb-1.5 block text-label-sm font-semibold uppercase tracking-wide text-slate-dark"
              >
                Deadline
              </label>
              <input
                id="edit-epic-deadline"
                type="date"
                min={minDeadline}
                aria-invalid={errors.deadline ? true : undefined}
                aria-describedby={errors.deadline ? "edit-epic-deadline-err" : undefined}
                className={`${inputBaseClass} ${fieldErrorRing(!!errors.deadline)}`}
                {...register("deadline")}
              />
              {errors.deadline ? (
                <p
                  id="edit-epic-deadline-err"
                  role="alert"
                  className="mt-1.5 text-sm text-error"
                >
                  {errors.deadline.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                navigate(`/project/${encodeURIComponent(projectId)}/epics`)
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
              {isSubmitting ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export function EditEpicPage() {
  const navigate = useNavigate();
  const { projectId, epicId } = useParams();
  const { getAccessToken, signOut } = useAuthSession();
  const [projectName, setProjectName] = useState("Project");
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [epic, setEpic] = useState<ProjectEpicItem | null>(null);
  const [bootLoading, setBootLoading] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId || !epicId) {
      setBootError("Project or epic not found.");
      setBootLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      setBootLoading(true);
      setBootError(null);
      try {
        const token = await getAccessToken();
        if (!token) throw new HttpError("Unauthorized", 401);
        const [project, projectMembers, row] = await Promise.all([
          fetchProjectById(token, projectId),
          fetchProjectMembers(token, projectId),
          fetchProjectEpicDetails(token, projectId, epicId),
        ]);
        if (cancelled) return;
        setProjectName(project.name);
        setMembers(projectMembers);
        setEpic(row);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof HttpError && error.status === 401) {
          signOut();
          navigate("/login", { replace: true });
          return;
        }
        if (error instanceof HttpError && error.status === 404) {
          setBootError("This epic was not found for this project.");
        } else {
          setBootError("Failed to load epic for editing. Please try again.");
        }
      } finally {
        if (!cancelled) setBootLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, epicId, getAccessToken, signOut, navigate]);

  if (bootLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 animate-pulse">
          <div className="mb-2 h-4 w-64 rounded bg-surface-highest" />
          <div className="h-9 w-3/4 max-w-md rounded bg-surface-highest" />
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card sm:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-11 w-full rounded bg-surface-highest" />
            <div className="h-28 w-full rounded bg-surface-highest" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-11 rounded bg-surface-highest" />
              <div className="h-11 rounded bg-surface-highest" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (bootError || !projectId || !epicId) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <div
          role="alert"
          className="rounded-lg bg-surface-error px-4 py-3 text-sm text-error"
        >
          {bootError ?? "Project or epic not found."}
        </div>
        {projectId ? (
          <Link
            to={`/project/${encodeURIComponent(projectId)}/epics`}
            className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
          >
            Back to epics
          </Link>
        ) : (
          <Link to="/project" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
            Back to projects
          </Link>
        )}
      </div>
    );
  }

  if (!epic) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <p className="text-body-md text-slate-medium">Epic not loaded.</p>
        <Link
          to={`/project/${encodeURIComponent(projectId)}/epics`}
          className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
        >
          Back to epics
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <EditEpicFormInner
        key={epic.id}
        projectId={projectId}
        projectName={projectName}
        epic={epic}
        members={members}
        getAccessToken={getAccessToken}
        signOut={signOut}
        navigate={navigate}
      />
    </div>
  );
}
