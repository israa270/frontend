import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  fetchProjectEpicDetails,
  fetchProjectEpics,
  type ProjectEpicItem,
} from "../../api/fetchProjectEpics";
import { fetchProjectById } from "../../api/fetchProjectById";
import { HttpError } from "../../api/httpError";
import { useAuthSession } from "../../hooks/useAuthSession";

const PAGE_SIZE = 10;
const MOBILE_QUERY = "(max-width: 767px)";

type EpicStatusFilter = "all" | "todo" | "done";

/** Client-side order for the current page of epics: `asc` = soonest deadline first, `desc` = latest first, `none` = API order. */
type EpicDeadlineOrder = "none" | "asc" | "desc";

function statusFromParam(value: string | null): EpicStatusFilter {
  if (value === "todo" || value === "done") return value;
  return "all";
}

function deadlineOrderFromParam(value: string | null): EpicDeadlineOrder {
  if (value === "asc" || value === "desc") return value;
  return "none";
}

function pageFromParam(value: string | null): number {
  if (!value) return 1;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

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

function formatModalDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function isDone(epic: ProjectEpicItem): boolean {
  const text = `${epic.title} ${epic.description}`.toLowerCase();
  return text.includes("done");
}

function deadlineTime(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : null;
}

function compareEpicDeadline(a: ProjectEpicItem, b: ProjectEpicItem, order: "asc" | "desc"): number {
  const ta = deadlineTime(a.deadline);
  const tb = deadlineTime(b.deadline);
  if (ta == null && tb == null) return 0;
  if (ta == null) return 1;
  if (tb == null) return -1;
  return order === "asc" ? ta - tb : tb - ta;
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
      <p className="mt-2 max-w-md text-body-md text-slate-medium">Failed to load epics</p>
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
      <h2 className="text-headline-md text-slate-dark">No epics found for this project</h2>
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

function EpicsNoResultsState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-10 rounded-2xl border border-surface-highest bg-white px-6 py-12 text-center shadow-soft">
      <h2 className="text-title-md text-slate-dark">No epics match your current filters.</h2>
      <p className="mt-2 text-body-md text-slate-medium">
        Try changing status or search terms.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary-container shadow-soft hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Reset filters
      </button>
    </div>
  );
}

function EpicDetailsModal({
  epic,
  loading,
  error,
  onClose,
}: {
  epic: ProjectEpicItem | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  if (!loading && !error && !epic) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-dark/35 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Epic details"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-card sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="animate-pulse space-y-5">
            <div className="h-5 w-20 rounded bg-surface-highest" />
            <div className="h-8 w-3/4 rounded bg-surface-highest" />
            <div className="h-20 w-full rounded bg-surface-highest" />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="h-12 rounded bg-surface-highest" />
              <div className="h-12 rounded bg-surface-highest" />
              <div className="h-12 rounded bg-surface-highest" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center">
            <h2 className="text-title-md text-slate-dark">Something went wrong</h2>
            <p className="mt-2 text-body-md text-slate-medium">{error}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary-container"
            >
              Close
            </button>
          </div>
        ) : epic ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                  {epic.epicId}
                </span>
                <h2 className="mt-3 text-headline-md text-slate-dark">{epic.title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex size-9 items-center justify-center rounded-lg text-slate-medium hover:bg-surface-low"
                aria-label="Close epic details"
              >
                <span className="icon-material text-xl" aria-hidden>
                  close
                </span>
              </button>
            </div>
            <p className="mt-5 text-body-md text-slate-medium">
              {epic.description.trim() || "No description provided"}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-label-sm font-semibold uppercase tracking-wide text-slate-light">
                  Created by
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-on-primary">
                    {initialsFromName(epic.createdBy?.name)}
                  </div>
                  <p className="text-sm font-semibold text-slate-dark">
                    {epic.createdBy?.name || "Unknown user"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-label-sm font-semibold uppercase tracking-wide text-slate-light">
                  Assignee
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-surface-low text-xs font-semibold text-primary">
                    {initialsFromName(epic.assignee?.name)}
                  </div>
                  <p className="text-sm font-semibold text-slate-dark">
                    {epic.assignee?.name || "Unassigned"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-label-sm font-semibold uppercase tracking-wide text-slate-light">
                  Created at
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-dark">
                  {formatModalDate(epic.createdAt)}
                </p>
              </div>
            </div>

            <div className="mt-7 border-t border-surface-highest pt-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-title-sm text-slate-dark">Epic Tasks</h3>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-primary hover:bg-surface-low"
                >
                  <span className="icon-material text-[18px]" aria-hidden>
                    add
                  </span>
                  Add Task
                </button>
              </div>
              <div className="mt-4 rounded-xl border-2 border-dashed border-surface-highest bg-surface-low/30 px-5 py-10 text-center">
                <span className="icon-material text-4xl text-slate-light" aria-hidden>
                  format_list_bulleted
                </span>
                <p className="mt-3 text-body-md text-slate-medium">
                  No tasks have been added to this epic yet
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container shadow-soft"
                >
                  <span className="icon-material text-[18px]" aria-hidden>
                    add
                  </span>
                  Add Task
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function ProjectEpicsPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getAccessToken, signOut } = useAuthSession();
  const isMobile = useIsMobileView();
  const selectedProjectId = projectId ?? "";
  const [projectName, setProjectName] = useState("Project");
  const [epics, setEpics] = useState<ProjectEpicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState(
    () => searchParams.get("q") ?? "",
  );
  const [statusFilter, setStatusFilter] = useState<EpicStatusFilter>(
    () => statusFromParam(searchParams.get("status")),
  );
  const [currentPage, setCurrentPage] = useState(() =>
    isMobile ? 1 : pageFromParam(searchParams.get("page")),
  );
  const [deadlineOrder, setDeadlineOrder] = useState<EpicDeadlineOrder>(
    () => deadlineOrderFromParam(searchParams.get("deadline")),
  );
  const [totalCount, setTotalCount] = useState(0);
  const [pageRange, setPageRange] = useState<{ start: number; end: number } | null>(
    null,
  );
  const [selectedEpic, setSelectedEpic] = useState<ProjectEpicItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const selectedEpicId = searchParams.get("epic");
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  // Keep list filters in sync with the URL (e.g. back/forward) without listing local state
  // in the dependency array (that would fight in-progress typing).
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const nextStatus = statusFromParam(searchParams.get("status"));
    const nextPage = pageFromParam(searchParams.get("page"));
    const nextDeadline = deadlineOrderFromParam(searchParams.get("deadline"));
    setSearch((prev) => (prev === q ? prev : q));
    setStatusFilter((prev) => (prev === nextStatus ? prev : nextStatus));
    setDeadlineOrder((prev) => (prev === nextDeadline ? prev : nextDeadline));
    if (!isMobile) {
      setCurrentPage((prev) => (prev === nextPage ? prev : nextPage));
    }
  }, [searchParams, isMobile]);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (search.trim()) next.set("q", search.trim());
        else next.delete("q");
        if (statusFilter !== "all") next.set("status", statusFilter);
        else next.delete("status");
        if (!isMobile && currentPage > 1) next.set("page", String(currentPage));
        else next.delete("page");
        if (deadlineOrder !== "none") next.set("deadline", deadlineOrder);
        else next.delete("deadline");
        return next;
      },
      { replace: true },
    );
  }, [search, statusFilter, currentPage, isMobile, deadlineOrder, setSearchParams]);

  const loadEpics = useCallback(async () => {
    if (!selectedProjectId) {
      setLoadError("Failed to load epics");
      setLoading(false);
      return;
    }
    if (isMobile && currentPage > 1) setLoadingMore(true);
    else setLoading(true);
    setLoadError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new HttpError("Unauthorized", 401);
      const offset = (currentPage - 1) * PAGE_SIZE;
      const [project, rows] = await Promise.all([
        fetchProjectById(token, selectedProjectId),
        fetchProjectEpics({
          accessToken: token,
          projectId: selectedProjectId,
          limit: PAGE_SIZE,
          offset,
        }),
      ]);
      setProjectName(project.name);
      setTotalCount(rows.totalCount);
      setPageRange(
        rows.rangeStart != null && rows.rangeEnd != null
          ? { start: rows.rangeStart, end: rows.rangeEnd }
          : null,
      );
      setEpics((prev) => {
        if (isMobile && currentPage > 1) {
          return [...prev, ...rows.epics];
        }
        return rows.epics;
      });
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) {
        signOut();
        navigate("/login", { replace: true });
        return;
      }
      setLoadError("Failed to load epics");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedProjectId, isMobile, currentPage, getAccessToken, signOut, navigate]);

  useEffect(() => {
    void loadEpics();
  }, [loadEpics]);

  useEffect(() => {
    setCurrentPage(1);
    setEpics([]);
    setTotalCount(0);
    setPageRange(null);
  }, [selectedProjectId]);

  useEffect(() => {
    if (isMobile) setCurrentPage(1);
  }, [isMobile]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        if (!prev.has("epic")) return prev;
        const next = new URLSearchParams(prev);
        next.delete("epic");
        return next;
      },
      { replace: true },
    );
    setSelectedEpic(null);
    setModalError(null);
    setModalLoading(false);
  }, [selectedProjectId, setSearchParams]);

  useEffect(() => {
    if (!isMobile || loading || loadingMore || !!loadError) return;
    if (epics.length >= totalCount || currentPage >= totalPages) return;
    const onScroll = () => {
      const threshold = 120;
      const bottomGap =
        document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      if (bottomGap <= threshold) {
        setCurrentPage((p) => (p < totalPages ? p + 1 : p));
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile, loading, loadingMore, loadError, epics.length, totalCount, currentPage, totalPages]);

  const createTo = selectedProjectId
    ? `/project/${encodeURIComponent(selectedProjectId)}/epics/new`
    : "/project";
  const statusOptions: Array<{ id: EpicStatusFilter; label: string }> = [
    { id: "all", label: "All" },
    { id: "todo", label: "To Do" },
    { id: "done", label: "Done" },
  ];
  const visibleEpics = useMemo(() => {
    const q = search.trim().toLowerCase();
    const searchFiltered = epics.filter((epic) => {
      if (!q) return true;
      return (
        epic.epicId.toLowerCase().includes(q) ||
        epic.title.toLowerCase().includes(q) ||
        epic.assignee?.name.toLowerCase().includes(q) ||
        epic.createdBy?.name.toLowerCase().includes(q)
      );
    });
    const statusFiltered = searchFiltered.filter((epic) => {
      if (statusFilter === "all") return true;
      const done = isDone(epic);
      return (
        statusFilter === "done"
          ? done
          : !done
      );
    });
    if (deadlineOrder === "none") return statusFiltered;
    const ordered = [...statusFiltered].sort((a, b) =>
      compareEpicDeadline(a, b, deadlineOrder),
    );
    return ordered;
  }, [epics, search, statusFilter, deadlineOrder]);
  const shownCount = epics.length;
  const rangeStart = pageRange?.start != null ? pageRange.start + 1 : shownCount > 0 ? 1 : 0;
  const rangeEnd = pageRange?.end != null ? pageRange.end + 1 : shownCount;
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages],
  );
  const handleSelectPage = useCallback(
    (page: number) => {
      const next = Math.min(Math.max(1, page), totalPages);
      if (next === currentPage) return;
      setCurrentPage(next);
      // Leaving a deep-linked modal open while changing pages is confusing; back/forward still restores `epic`.
      setSearchParams(
        (prev) => {
          if (!prev.has("epic")) return prev;
          const merged = new URLSearchParams(prev);
          merged.delete("epic");
          return merged;
        },
        { replace: true },
      );
      setSelectedEpic(null);
      setModalError(null);
      setModalLoading(false);
    },
    [totalPages, currentPage, setSearchParams],
  );

  useEffect(() => {
    if (!selectedEpicId || !selectedProjectId) return;
    let cancelled = false;
    void (async () => {
      setModalLoading(true);
      setModalError(null);
      try {
        const token = await getAccessToken();
        if (!token) throw new HttpError("Unauthorized", 401);
        const epic = await fetchProjectEpicDetails(token, selectedProjectId, selectedEpicId);
        if (cancelled) return;
        setSelectedEpic(epic);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof HttpError && error.status === 401) {
          signOut();
          navigate("/login", { replace: true });
          return;
        }
        setModalError("Failed to load epic details");
      } finally {
        if (!cancelled) setModalLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedEpicId, selectedProjectId, getAccessToken, signOut, navigate]);

  const openEpicModal = useCallback(
    (epicId: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("epic", epicId);
          return next;
        },
        { replace: true },
      );
      setSelectedEpic(null);
      setModalError(null);
    },
    [setSearchParams],
  );
  const closeEpicModal = useCallback(() => {
    setSearchParams(
      (prev) => {
        if (!prev.has("epic")) return prev;
        const next = new URLSearchParams(prev);
        next.delete("epic");
        return next;
      },
      { replace: true },
    );
    setSelectedEpic(null);
    setModalError(null);
    setModalLoading(false);
  }, [setSearchParams]);
  const handleResetFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setDeadlineOrder("none");
    setCurrentPage(1);
  }, []);

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
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((opt) => {
            const active = statusFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStatusFilter(opt.id)}
                className={
                  active
                    ? "rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-on-primary"
                    : "rounded-full border border-surface-highest bg-white px-4 py-1.5 text-sm font-medium text-slate-dark hover:bg-surface-low"
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <div className="flex min-w-0 flex-col gap-1 sm:max-w-[280px] sm:flex-row sm:items-center sm:gap-2">
          <label htmlFor="epic-deadline-sort" className="shrink-0 text-sm font-medium text-slate-dark">
            Deadline
          </label>
          <select
            id="epic-deadline-sort"
            value={deadlineOrder}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "none" || v === "asc" || v === "desc") {
                setDeadlineOrder(v);
              }
            }}
            title="Reorders only the epics on this page. Pages still come from the server in API order."
            className="min-w-0 flex-1 rounded-lg border border-surface-highest bg-white px-3 py-2 text-sm text-slate-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/35"
          >
            <option value="none">Default order</option>
            <option value="asc">Soonest first</option>
            <option value="desc">Latest first</option>
          </select>
        </div>
      </div>

      {loading ? (
        <EpicsLoadingGrid />
      ) : loadError ? (
        <EpicsErrorState onRetry={() => void loadEpics()} />
      ) : epics.length === 0 ? (
        <EpicsEmptyState createTo={createTo} />
      ) : visibleEpics.length === 0 ? (
        <EpicsNoResultsState onReset={handleResetFilters} />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {visibleEpics.map((epic) => {
              const done = isDone(epic);
              return (
                <article
                  key={epic.id}
                  onClick={() => openEpicModal(epic.id)}
                  className={`rounded-2xl border bg-white p-4 shadow-soft ${
                    done
                      ? "border-primary/20 bg-primary/5"
                      : "border-surface-highest"
                  } cursor-pointer`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                      {epic.epicId}
                    </span>
                    <button
                      type="button"
                      aria-label={`Actions for ${epic.title}`}
                      onClick={(e) => e.stopPropagation()}
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
              Showing{" "}
              <span className="font-semibold text-slate-dark">
                {rangeStart}-{rangeEnd}
              </span>{" "}
              of <span className="font-semibold text-slate-dark">{totalCount}</span> epics
            </p>
            {isMobile ? (
              <p className="text-sm text-slate-medium">
                {loadingMore ? "Loading more..." : "Scroll for more"}
              </p>
            ) : (
              <nav className="flex items-center gap-1" aria-label="Pagination">
                <button
                  type="button"
                  disabled={!canGoPrev || loading}
                  onClick={() => handleSelectPage(currentPage - 1)}
                  className="flex size-9 items-center justify-center rounded-lg border border-surface-highest bg-white text-slate-medium disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Previous page"
                >
                  <span className="icon-material text-xl" aria-hidden>
                    chevron_left
                  </span>
                </button>
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handleSelectPage(page)}
                    disabled={loading}
                    className={
                      page === currentPage
                        ? "flex size-9 items-center justify-center rounded-lg bg-primary-container text-sm font-semibold text-on-primary-container"
                        : "flex size-9 items-center justify-center rounded-lg border border-surface-highest bg-white text-sm font-medium text-slate-dark"
                    }
                    aria-current={page === currentPage ? "page" : undefined}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={!canGoNext || loading}
                  onClick={() => handleSelectPage(currentPage + 1)}
                  className="flex size-9 items-center justify-center rounded-lg border border-surface-highest bg-white text-slate-medium disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Next page"
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
      {selectedEpicId ? (
        <EpicDetailsModal
          epic={selectedEpic}
          loading={modalLoading}
          error={modalError}
          onClose={closeEpicModal}
        />
      ) : null}
    </div>
  );
}
