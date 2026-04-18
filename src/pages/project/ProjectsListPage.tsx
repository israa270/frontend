import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchProjects, type ProjectListItem } from "../../api/fetchProjects";
import { HttpError } from "../../api/httpError";
import { useAuthSession } from "../../hooks/useAuthSession";
import { formatProjectDate } from "../../lib/formatProjectDate";

const SKELETON_COUNT = 6;

type ProjectsLoadResult =
  | { status: "ok"; list: ProjectListItem[] }
  | { status: "unauthorized" }
  | { status: "error"; message: string };

async function performProjectsLoad(
  getAccessToken: () => Promise<string | null>,
): Promise<ProjectsLoadResult> {
  try {
    const token = await getAccessToken();
    if (!token) return { status: "unauthorized" };
    const list = await fetchProjects(token);
    return { status: "ok", list };
  } catch (e) {
    if (e instanceof HttpError && e.status === 401) {
      return { status: "unauthorized" };
    }
    return {
      status: "error",
      message:
        e instanceof Error
          ? e.message
          : "Could not load projects. Please try again.",
    };
  }
}

function ProjectCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-surface-highest bg-white p-5 shadow-soft">
      <div className="h-5 w-3/4 rounded bg-surface-highest" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-surface-highest" />
        <div className="h-3 w-5/6 rounded bg-surface-highest" />
        <div className="h-3 w-2/3 rounded bg-surface-highest" />
      </div>
      <div className="mt-6 flex justify-between gap-4">
        <div className="h-3 w-20 rounded bg-surface-highest" />
        <div className="h-3 w-24 rounded bg-surface-highest" />
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectListItem }) {
  return (
    <article className="flex flex-col rounded-2xl border border-surface-highest bg-white p-5 shadow-soft">
      <h2 className="text-title-md font-semibold text-slate-dark">
        {project.name}
      </h2>
      <p className="mt-2 min-h-[4.5rem] flex-1 text-body-md text-slate-medium">
        {project.description.trim() ? project.description : "—"}
      </p>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-2 border-t border-surface-highest pt-4">
        <span className="text-label-sm font-semibold uppercase tracking-wide text-slate-light">
          Created at
        </span>
        <time
          className="text-sm font-medium text-slate-dark"
          dateTime={project.createdAt ?? undefined}
        >
          {formatProjectDate(project.createdAt)}
        </time>
      </div>
    </article>
  );
}

function AddProjectPlaceholderCard() {
  return (
    <Link
      to="/project/add"
      className="flex min-h-[14rem] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-surface-highest bg-white/80 px-5 py-8 text-center text-primary transition-colors hover:border-primary-container hover:bg-surface-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span
        className="icon-material text-4xl text-primary-container"
        aria-hidden
      >
        add
      </span>
      <span className="text-label-sm font-semibold uppercase tracking-wide">
        Add project
      </span>
    </Link>
  );
}

function ProjectsErrorScreen({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      className="flex min-h-[min(24rem,60vh)] flex-col items-center justify-center rounded-2xl border border-surface-highest bg-white px-6 py-12 text-center shadow-soft"
      role="alert"
    >
      <span className="icon-material mb-4 text-5xl text-error" aria-hidden>
        error_outline
      </span>
      <h2 className="text-title-md text-slate-dark">Something went wrong</h2>
      <p className="mt-2 max-w-md text-body-md text-slate-medium">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary-container shadow-soft hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Try again
      </button>
    </div>
  );
}

export function ProjectsListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAccessToken, signOut } = useAuthSession();
  const [projects, setProjects] = useState<ProjectListItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applyLoadResult = useCallback(
    (result: ProjectsLoadResult) => {
      if (result.status === "unauthorized") {
        signOut();
        navigate("/login", {
          replace: true,
          state: { from: location.pathname },
        });
        return;
      }
      if (result.status === "error") {
        setLoadError(result.message);
        setProjects(null);
        return;
      }
      setProjects(result.list);
    },
    [signOut, navigate, location.pathname],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await performProjectsLoad(getAccessToken);
      if (cancelled) return;
      applyLoadResult(result);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [getAccessToken, applyLoadResult]);

  const handleRetry = useCallback(() => {
    void (async () => {
      setLoading(true);
      setLoadError(null);
      const result = await performProjectsLoad(getAccessToken);
      applyLoadResult(result);
      setLoading(false);
    })();
  }, [getAccessToken, applyLoadResult]);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-headline-lg text-slate-dark">Projects</h1>
          <p className="mt-1 text-body-md text-slate-medium">
            Manage and curate your projects
          </p>
        </div>
        <Link
          to="/project/add"
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-primary-container px-4 py-2.5 text-sm font-semibold text-on-primary-container shadow-soft transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:self-auto"
        >
          <span className="icon-material text-[20px]" aria-hidden>
            add
          </span>
          Create New Project
        </Link>
      </header>

      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : loadError ? (
          <ProjectsErrorScreen message={loadError} onRetry={handleRetry} />
        ) : projects?.length === 0 ? (
          <div className="flex min-h-[min(20rem,50vh)] flex-col items-center justify-center rounded-2xl border border-dashed border-surface-highest bg-white px-6 py-14 text-center shadow-soft">
            <span
              className="icon-material mb-4 text-5xl text-slate-light"
              aria-hidden
            >
              folder_open
            </span>
            <p className="max-w-md text-body-md text-slate-medium">
              You don&apos;t have any projects yet.
            </p>
            <Link
              to="/project/add"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary-container shadow-soft hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span className="icon-material text-[20px]" aria-hidden>
                add
              </span>
              Create New Project
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects?.map((project, index) => (
                <ProjectCard key={`${project.id}-${index}`} project={project} />
              ))}
              <AddProjectPlaceholderCard />
            </div>

            <footer className="mt-10 flex flex-col gap-4 border-t border-surface-highest pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-medium">
                Showing{" "}
                <span className="font-semibold text-slate-dark">
                  {projects?.length ?? 0}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-dark">
                  {projects?.length ?? 0}
                </span>{" "}
                active projects
              </p>
              <nav
                className="flex items-center justify-center gap-1 sm:justify-end"
                aria-label="Pagination"
              >
                <button
                  type="button"
                  className="flex size-9 items-center justify-center rounded-lg border border-surface-highest bg-white text-slate-medium"
                  aria-label="Previous page"
                  disabled
                >
                  <span className="icon-material text-xl" aria-hidden>
                    chevron_left
                  </span>
                </button>
                <button
                  type="button"
                  className="flex size-9 items-center justify-center rounded-lg bg-primary-container text-sm font-semibold text-on-primary-container"
                  aria-current="page"
                  aria-label="Page 1"
                >
                  1
                </button>
                <button
                  type="button"
                  className="flex size-9 items-center justify-center rounded-lg border border-surface-highest bg-white text-sm font-medium text-slate-dark"
                  aria-label="Page 2"
                >
                  2
                </button>
                <button
                  type="button"
                  className="flex size-9 items-center justify-center rounded-lg border border-surface-highest bg-white text-slate-medium"
                  aria-label="Next page"
                  disabled
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
    </div>
  );
}
