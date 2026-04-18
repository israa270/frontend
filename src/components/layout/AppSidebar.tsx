import { NavLink, useNavigate } from "react-router-dom";
import { useAuthSession } from "../../hooks/useAuthSession";
import { useAppDispatch } from "../../store/hooks";
import { clearUserProfile } from "../../store/slices/userSlice";
import { TasklyLogo } from "../TasklyLogo";

const navClass = ({
  isActive,
  collapsed,
}: {
  isActive: boolean;
  collapsed: boolean;
}) =>
  [
    "flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors",
    collapsed ? "justify-center px-2" : "px-3",
    isActive
      ? "bg-surface-highest text-primary"
      : "text-slate-dark hover:bg-surface-highest/60",
  ].join(" ");

type NavItem = {
  to: string;
  end?: boolean;
  label: string;
  icon: string;
};

const ITEMS: NavItem[] = [
  { to: "/dashboard", end: true, label: "Projects", icon: "folder" },
  { to: "/dashboard/epics", label: "Project Epics", icon: "account_tree" },
  { to: "/dashboard/tasks", label: "Project Tasks", icon: "checklist" },
  { to: "/dashboard/members", label: "Project Members", icon: "groups" },
  { to: "/dashboard/details", label: "Project Details", icon: "info" },
];

type AppSidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onNavigate?: () => void;
  /** Hide collapse control in mobile drawer (desktop only). */
  showCollapseControl?: boolean;
};

export function AppSidebar({
  collapsed,
  onToggleCollapsed,
  onNavigate,
  showCollapseControl = true,
}: AppSidebarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { signOut } = useAuthSession();

  const linkClick = () => {
    onNavigate?.();
  };

  const handleLogout = () => {
    onNavigate?.();
    dispatch(clearUserProfile());
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div
        className={`flex shrink-0 items-center border-b border-surface-highest py-4 ${collapsed ? "justify-center px-2" : "px-4"}`}
      >
        <TasklyLogo compact={collapsed} to="/dashboard" className="shrink-0" />
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2"
        aria-label="Main"
      >
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={linkClick}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => navClass({ isActive, collapsed })}
          >
            <span className="icon-material shrink-0 text-[22px]" aria-hidden>
              {item.icon}
            </span>
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
          </NavLink>
        ))}
      </nav>

      <div
        className={`mt-auto shrink-0 space-y-1 border-t border-surface-highest p-2 ${collapsed ? "px-1" : ""}`}
      >
        {showCollapseControl ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`flex w-full items-center gap-3 rounded-lg py-2.5 text-sm font-medium text-primary hover:bg-surface-highest/60 ${collapsed ? "justify-center px-2" : "px-3"}`}
          >
            <span className="icon-material text-[22px]" aria-hidden>
              {collapsed ? "chevron_right" : "chevron_left"}
            </span>
            {!collapsed ? <span>Collapse</span> : null}
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`flex w-full items-center gap-3 rounded-lg py-2.5 text-sm font-medium text-error hover:bg-red-50 ${collapsed ? "justify-center px-2" : "px-3"}`}
        >
          <span className="icon-material text-[22px]" aria-hidden>
            logout
          </span>
          {!collapsed ? <span>Logout</span> : null}
        </button>
      </div>
    </div>
  );
}
