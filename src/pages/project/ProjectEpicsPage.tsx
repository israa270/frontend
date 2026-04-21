import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchProjectEpics, type ProjectEpicItem } from "../../api/fetchProjectEpics";
import { fetchProjectById } from "../../api/fetchProjectById";
import { HttpError } from "../../api/httpError";
import { useAuthSession } from "../../hooks/useAuthSession";

function initialsFromName(name: string | undefined): string {
  if (!name) return "U";
  const parts = name
    .split(/\s+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return "U";
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function isDone(epic: ProjectEpicItem): boolean {
  const text = `${epic.title} ${epic.description}`.toLowerCase();
  return text.includes("done");
}

function EpicsLoadingGrid() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-surface-highest bg-white p-4 shadow-soft"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-20 rounded bg-surface-highest" />
            <div className="size-6 rounded bg-surface-highest" />
          </div>
          <div className="h-6 w-4/5 rounded bg-surface-highest" />
          <div className="mt-5 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-surface-highest" />
            <div className="h-4 w-32 rounded bg-surface-highest" />
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-surface-highest pt-3">
            <div className="h-3 w-36 rounded bg-surface-highest" />
            <div className="h-3 w-24 rounded bg-surface-highest" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EpicsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-10 flex min-h-[45vh] flex-col items-center justify-center rounded-2xl px-6 text-center">
      <span
        className="icon-material mb-4 flex size-14 items-center justify-center rounded-xl bg-surface-error text-3xl text-error"
        aria-hidden
      >
        error_outline
      </span>
      <h2 className="text-title-md text-slate-dark">Something went wrong</h2>
      <p className="mt-2 max-w-md text-body-md text-slate-medium">
        Failed to load project epics. Please try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary-container shadow-soft hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Retry Connection
      </button>
    </div>
  );
}

function EpicsEmptyState({ createTo }: { createTo: string }) {
  return (
    <div className="mt-10 flex min-h-[45vh] flex-col items-center justify-center rounded-2xl px-6 text-center">
      <div className="mb-6 rounded-3xl bg-white p-6 shadow-soft">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-surface-low text-primary">
            <span className="icon-material text-2xl">rocket_launch</span>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl bg-surface-low text-slate-light">
            <span className="icon-material text-2xl">accessibility</span>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl bg-surface-low text-slate-light">
            <span className="icon-material text-2xl">grid_view</span>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl border-2 border-dashed border-surface-highest text-slate-light">
            <span className="icon-material text-2xl">add</span>
          </div>
        </div>
      </div>
      <h2 className="text-headline-md text-slate-dark">No epics in this project yet.</h2>
      <p className="mt-3 max-w-xl text-body-md text-slate-medium">
        Break down your large project into manageable epics to track progress better.
      </p>
      <Link
        to={createTo}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary-container shadow-soft hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="icon-material text-[20px]" aria-hidden>
          bolt
        </span>
        Create First Epic
      </Link>
    </div>
  );
}

export function ProjectEpicsPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { getAccessToken, signOut } = useAuthSession();
  const [projectName, setProjectName] = useState("Project");
  const [epics, setEpics] = useState<ProjectEpicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadEpics = useCallback(async () => {
    if (!projectId) {
      setLoadError("Failed to load project epics. Please try again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new HttpError("Unauthorized", 401);
      const [project, rows] = await Promise.all([
        fetchProjectById(token, projectId),
        fetchProjectEpics(token, projectId),
      ]);
      setProjectName(project.name);
      setEpics(rows);
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) {
        signOut();
        navigate("/login", { replace: true });
        return;
      }
      setLoadError("Failed to load project epics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [projectId, getAccessToken, signOut, navigate]);

  useEffect(() => {
    void loadEpics();
  }, [loadEpics]);

  const filteredEpics = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return epics;
    return epics.filter((epic) => {
      return (
        epic.epicId.toLowerCase().includes(q) ||
        epic.title.toLowerCase().includes(q) ||
        epic.assignee?.name.toLowerCase().includes(q) ||
        epic.createdBy?.name.toLowerCase().includes(q)
      );
    });
  }, [epics, search]);

  const createTo = projectId
    ? `/project/${encodeURIComponent(projectId)}/epics/new`
    : "/project";

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
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
              <li aria-hidden className="text-slate-light">/</li>
              <li className="text-slate-dark">{projectName}</li>
              <li aria-hidden className="text-slate-light">/</li>
              <li className="text-slate-dark">Epics</li>
            </ol>
          </nav>
          <h1 className="text-headline-lg text-slate-dark">Project Epics</h1>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <label className="relative block sm:w-[260px]">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-medium">
              <span className="icon-material text-[18px]" aria-hidden>
                search
              </span>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search epics..."
              className="w-full rounded-lg border-0 bg-[#E8EFFF] py-3 pl-10 pr-3 text-body-md text-slate-dark placeholder:text-slate-light focus:outline-none focus:ring-2 focus:ring-primary/35"
            />
          </label>
          <Link
            to={createTo}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-container px-5 py-3 text-sm font-semibold text-on-primary-container shadow-soft hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span className="icon-material text-[20px]" aria-hidden>
              add
            </span>
            New Epic
          </Link>
        </div>
      </div>

      {loading ? (
        <EpicsLoadingGrid />
      ) : loadError ? (
        <EpicsErrorState onRetry={() => void loadEpics()} />
      ) : filteredEpics.length === 0 ? (
        <EpicsEmptyState createTo={createTo} />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {filteredEpics.map((epic) => {
              const done = isDone(epic);
              return (
                <article
                  key={epic.id}
                  className={`rounded-2xl border bg-white p-4 shadow-soft ${
                    done
                      ? "border-primary/20 bg-primary/5"
                      : "border-surface-highest"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                      {epic.epicId}
                    </span>
                    <button
                      type="button"
                      aria-label={`Actions for ${epic.title}`}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-slate-medium hover:bg-surface-low"
                    >
                      <span className="icon-material text-[18px]" aria-hidden>
                        more_vert
                      </span>
                    </button>
                  </div>
                  <h2 className="text-title-md text-slate-dark">{epic.title}</h2>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-10 items-center justify-center rounded-xl text-sm font-semibold ${
                          done
                            ? "bg-primary text-on-primary"
                            : "bg-emerald-200 text-emerald-800"
                        }`}
                      >
                        {initialsFromName(epic.assignee?.name)}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-light">
                          Assignee
                        </p>
                        <p className="text-sm font-semibold text-slate-dark">
                          {epic.assignee?.name || "Unassigned"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                        done
                          ? "bg-primary/20 text-primary"
                          : "bg-surface-low text-slate-medium"
                      }`}
                    >
                      {done ? "Done" : "To Do"}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-surface-highest pt-3 text-xs text-slate-medium">
                    <span>Created by: {epic.createdBy?.name || "Unknown user"}</span>
                    <span>{formatDate(epic.createdAt ?? epic.deadline)}</span>
                  </div>
                </article>
              );
            })}
          </div>

          <footer className="mt-8 flex flex-col gap-4 border-t border-surface-highest pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-medium">
              Showing <span className="font-semibold text-slate-dark">{filteredEpics.length}</span>{" "}
              of <span className="font-semibold text-slate-dark">{epics.length}</span> epics
            </p>
            <nav className="flex items-center gap-1" aria-label="Pagination">
              <button
                type="button"
                disabled
                className="flex size-9 items-center justify-center rounded-lg border border-surface-highest bg-white text-slate-medium disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous page"
              >
                <span className="icon-material text-xl" aria-hidden>
                  chevron_left
                </span>
              </button>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-lg bg-primary-container text-sm font-semibold text-on-primary-container"
                aria-current="page"
              >
                1
              </button>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-lg border border-surface-highest bg-white text-sm font-medium text-slate-dark"
              >
                2
              </button>
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-lg border border-surface-highest bg-white text-slate-medium"
                aria-label="Next page"
              >
                <span className="icon-material text-xl" aria-hidden>
                  chevron_right
                </span>
              </button>
            </nav>
          </footer>
        </>
      )}
    </div>
  );
}
