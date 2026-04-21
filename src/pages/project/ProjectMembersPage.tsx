import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchProjectById } from "../../api/fetchProjectById";
import { fetchProjectMembers, type ProjectMember } from "../../api/fetchProjectMembers";
import { HttpError } from "../../api/httpError";
import { useAuthSession } from "../../hooks/useAuthSession";

function initialsFromName(name: string): string {
  const parts = name
    .split(/\s+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return "U";
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function formatJoinedAt(value: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function roleChipClass(role: ProjectMember["role"]): string {
  if (role === "owner") return "bg-primary text-on-primary";
  if (role === "admin") return "bg-primary/15 text-primary";
  if (role === "viewer") return "bg-slate-200 text-slate-dark";
  return "bg-emerald-100 text-emerald-800";
}

function roleLabel(role: ProjectMember["role"]): string {
  return role[0].toUpperCase() + role.slice(1);
}

function MembersTableSkeleton() {
  return (
    <div className="mt-6 rounded-2xl border border-surface-highest bg-white p-6 shadow-soft">
      <div className="animate-pulse space-y-5">
        <div className="grid grid-cols-[2fr_1fr_1fr_40px] gap-4">
          <div className="h-3 w-24 rounded bg-surface-highest" />
          <div className="h-3 w-16 rounded bg-surface-highest" />
          <div className="h-3 w-20 rounded bg-surface-highest" />
          <div className="h-3 w-8 rounded bg-surface-highest" />
        </div>
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="grid grid-cols-[2fr_1fr_1fr_40px] items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-surface-highest" />
              <div className="space-y-2">
                <div className="h-3 w-36 rounded bg-surface-highest" />
                <div className="h-3 w-44 rounded bg-surface-highest" />
              </div>
            </div>
            <div className="h-7 w-20 rounded-full bg-surface-highest" />
            <div className="h-3 w-24 rounded bg-surface-highest" />
            <div className="ml-auto h-3 w-5 rounded bg-surface-highest" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MembersErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mt-10 flex min-h-[45vh] flex-col items-center justify-center rounded-2xl px-6 text-center">
      <span
        className="icon-material mb-4 flex size-14 items-center justify-center rounded-xl bg-surface-error text-3xl text-error"
        aria-hidden
      >
        visibility_off
      </span>
      <h2 className="text-title-md text-slate-dark">Something went wrong</h2>
      <p className="mt-2 max-w-md text-body-md text-slate-medium">{message}</p>
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

export function ProjectMembersPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { getAccessToken, signOut } = useAuthSession();
  const [projectName, setProjectName] = useState("Project");
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    if (!projectId) {
      setLoadError("Failed to load project members. Please try again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new HttpError("Unauthorized", 401);
      }
      const [project, projectMembers] = await Promise.all([
        fetchProjectById(token, projectId),
        fetchProjectMembers(token, projectId),
      ]);
      setProjectName(project.name);
      setMembers(projectMembers);
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) {
        signOut();
        navigate("/login", { replace: true });
        return;
      }
      setLoadError("Failed to load project members. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [projectId, getAccessToken, signOut, navigate]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const hasMembers = useMemo(() => members.length > 0, [members.length]);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
              <li aria-hidden className="text-slate-light">
                /
              </li>
              <li className="text-slate-dark">{projectName}</li>
              <li aria-hidden className="text-slate-light">
                /
              </li>
              <li className="text-slate-dark">Members</li>
            </ol>
          </nav>
          <h1 className="text-headline-lg text-slate-dark">Project Members</h1>
        </div>
        <button
          type="button"
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-primary-container px-4 py-2.5 text-sm font-semibold text-on-primary-container shadow-soft transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:self-auto"
        >
          <span className="icon-material text-[20px]" aria-hidden>
            person_add
          </span>
          Invite Member
        </button>
      </div>

      {loading ? (
        <MembersTableSkeleton />
      ) : loadError ? (
        <MembersErrorState message={loadError} onRetry={() => void loadMembers()} />
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-surface-highest bg-white shadow-soft">
          <div className="hidden grid-cols-[2fr_1fr_1fr_40px] gap-4 border-b border-surface-highest bg-surface-low px-6 py-4 text-label-sm font-semibold uppercase tracking-wide text-slate-medium md:grid">
            <span>Member</span>
            <span>Role</span>
            <span>Joined at</span>
            <span className="text-right">Actions</span>
          </div>
          {!hasMembers ? (
            <div className="px-6 py-10 text-center text-body-md text-slate-medium">
              No members found for this project.
            </div>
          ) : (
            <ul className="divide-y divide-surface-highest">
              {members.map((member) => (
                <li key={member.id} className="px-6 py-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr_40px] md:items-center md:gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-low text-sm font-semibold text-primary">
                        {initialsFromName(member.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-body-md font-semibold text-slate-dark">
                          {member.name}
                        </p>
                        <p className="truncate text-sm text-slate-medium">{member.email || "—"}</p>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${roleChipClass(member.role)}`}
                      >
                        {roleLabel(member.role)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-medium">{formatJoinedAt(member.joinedAt)}</p>
                    <button
                      type="button"
                      aria-label={`Actions for ${member.name}`}
                      className="ml-auto inline-flex size-8 items-center justify-center rounded-lg text-slate-medium hover:bg-surface-low"
                    >
                      <span className="icon-material text-[18px]" aria-hidden>
                        more_vert
                      </span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
