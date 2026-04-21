import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchProjects, type ProjectListItem } from "../../api/fetchProjects";
import { HttpError } from "../../api/httpError";
import { useAuthSession } from "../../hooks/useAuthSession";
import { formatProjectDate } from "../../lib/formatProjectDate";

const SKELETON_COUNT = 6;
const PAGE_SIZE = 10;
const MOBILE_QUERY = "(max-width: 767px)";

type ProjectsLoadResult =
  | {
      status: "ok";
      list: ProjectListItem[];
      totalCount: number;
      rangeStart: number | null;
      rangeEnd: number | null;
    }
  | { status: "unauthorized" }
  | { status: "error"; message: string };

function useIsMobileView(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_QUERY).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

async function performProjectsLoad(
  getAccessToken: () => Promise<string | null>,
  page: number,
  limit: number,
): Promise<ProjectsLoadResult> {
  try {
    const token = await getAccessToken();
    if (!token) return { status: "unauthorized" };
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * limit;
    const { projects, totalCount, rangeStart, rangeEnd } = await fetchProjects({
      accessToken: token,
      limit,
      offset,
    });
    return { status: "ok", list: projects, totalCount, rangeStart, rangeEnd };
  } catch (e) {
    if (e instanceof HttpError && e.status === 401) {
      return { status: "unauthorized" };
    }
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Failed to load projects",
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

function ProjectCard({
  project,
  onOpen,
  onEdit,
}: {
  project: ProjectListItem;
  onOpen: (projectId: string) => void;
  onEdit: (projectId: string) => void;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-surface-highest bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-title-md font-semibold text-slate-dark">
          {project.name}
        </h2>
        <button
          type="button"
          aria-label={`Edit ${project.name}`}
          title="Edit project"
          onClick={() => onEdit(project.id)}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-surface-highest text-slate-medium hover:bg-surface-low hover:text-slate-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="icon-material text-[18px]" aria-hidden>
            edit
          </span>
        </button>
      </div>
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
      <button
        type="button"
        onClick={() => onOpen(project.id)}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-surface-low px-4 py-2.5 text-sm font-semibold text-slate-dark shadow-soft hover:bg-surface-highest/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Open project
        <span className="icon-material text-[18px]" aria-hidden>
          chevron_right
        </span>
      </button>
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
  const isMobile = useIsMobileView();
  const [projects, setProjects] = useState<ProjectListItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageRange, setPageRange] = useState<{ start: number; end: number } | null>(
    null,
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const applyLoadResult = useCallback(
    (result: ProjectsLoadResult, page: number) => {
      if (result.status === "unauthorized") {
        signOut();
        navigate("/login", {
          replace: true,
          state: { from: location.pathname },
        });
        return;
      }
      if (result.status === "error") {
        setLoadError("Failed to load projects");
        setProjects(null);
        return;
      }
      setLoadError(null);
      setTotalCount(result.totalCount);
      setPageRange(
        result.rangeStart != null && result.rangeEnd != null
          ? { start: result.rangeStart, end: result.rangeEnd }
          : null,
      );
      setProjects((prev) => {
        if (isMobile && page > 1) {
          return [...(prev ?? []), ...result.list];
        }
        return result.list;
      });
    },
    [signOut, navigate, location.pathname, isMobile],
  );

  const loadPage = useCallback(
    async (page: number) => {
      setLoading(true);
      const result = await performProjectsLoad(getAccessToken, page, PAGE_SIZE);
      applyLoadResult(result, page);
      setLoading(false);
    },
    [getAccessToken, applyLoadResult],
  );

  useEffect(() => {
    if (isMobile) {
      setCurrentPage(1);
    }
  }, [isMobile]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isMobile && currentPage > 1) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const result = await performProjectsLoad(getAccessToken, currentPage, PAGE_SIZE);
      if (cancelled) return;
      applyLoadResult(result, currentPage);
      if (!cancelled) {
        setLoading(false);
        setLoadingMore(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getAccessToken, applyLoadResult, currentPage, isMobile]);

  const handleRetry = useCallback(() => {
    setLoadError(null);
    if (isMobile) {
      if (currentPage !== 1) {
        setCurrentPage(1);
        return;
      }
      void loadPage(1);
      return;
    }
    void loadPage(currentPage);
  }, [currentPage, isMobile, loadPage]);

  useEffect(() => {
    if (!isMobile || loading || loadingMore || !!loadError) return;
    if ((projects?.length ?? 0) >= totalCount) return;
    const onScroll = () => {
      const threshold = 100;
      const bottomGap =
        document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      if (bottomGap <= threshold) {
        setCurrentPage((p) => p + 1);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile, loading, loadingMore, loadError, projects, totalCount]);

  const handleSelectPage = useCallback(
    (page: number) => {
      const next = Math.min(Math.max(1, page), totalPages);
      if (next !== currentPage) setCurrentPage(next);
    },
    [totalPages, currentPage],
  );

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  const shownCount = projects?.length ?? 0;
  const rangeStart = pageRange?.start != null ? pageRange.start + 1 : shownCount > 0 ? 1 : 0;
  const rangeEnd = pageRange?.end != null ? pageRange.end + 1 : shownCount;
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const handleOpenProject = useCallback(
    (projectId: string) => {
      navigate(`/project/${encodeURIComponent(projectId)}/epics`);
    },
    [navigate],
  );
  const handleEditProject = useCallback(
    (projectId: string) => {
      navigate(`/project/${encodeURIComponent(projectId)}/edit`);
    },
    [navigate],
  );

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
        {loading && (projects?.length ?? 0) === 0 ? (
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
            <p className="max-w-md text-body-md text-slate-medium">No projects found</p>
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
                <ProjectCard
                  key={`${project.id}-${index}`}
                  project={project}
                  onOpen={handleOpenProject}
                  onEdit={handleEditProject}
                />
              ))}
              <AddProjectPlaceholderCard />
            </div>

            <footer className="mt-10 flex flex-col gap-4 border-t border-surface-highest pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-medium">
                Showing{" "}
                <span className="font-semibold text-slate-dark">
                  {rangeStart}-{rangeEnd}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-dark">
                  {totalCount}
                </span>{" "}
                active projects
              </p>
              {isMobile ? (
                <div className="text-sm text-slate-medium">
                  {loadingMore ? "Loading more..." : "Scroll for more"}
                </div>
              ) : (
                <nav
                  className="flex items-center justify-center gap-1 sm:justify-end"
                  aria-label="Pagination"
                >
                  <button
                    type="button"
                    className="flex size-9 items-center justify-center rounded-lg border border-surface-highest bg-white text-slate-medium disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Previous page"
                    disabled={!canGoPrev || loading}
                    onClick={() => handleSelectPage(currentPage - 1)}
                  >
                    <span className="icon-material text-xl" aria-hidden>
                      chevron_left
                    </span>
                  </button>
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={
                        page === currentPage
                          ? "flex size-9 items-center justify-center rounded-lg bg-primary-container text-sm font-semibold text-on-primary-container"
                          : "flex size-9 items-center justify-center rounded-lg border border-surface-highest bg-white text-sm font-medium text-slate-dark"
                      }
                      aria-current={page === currentPage ? "page" : undefined}
                      aria-label={`Page ${page}`}
                      onClick={() => handleSelectPage(page)}
                      disabled={loading}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="flex size-9 items-center justify-center rounded-lg border border-surface-highest bg-white text-slate-medium disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Next page"
                    disabled={!canGoNext || loading}
                    onClick={() => handleSelectPage(currentPage + 1)}
                  >
                    <span className="icon-material text-xl" aria-hidden>
                      chevron_right
                    </span>
                  </button>
                </nav>
              )}
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
