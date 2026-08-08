import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bot,
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
  Dumbbell,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";

const navItems = [
  { to: ROUTES.profile, label: "My Profile", icon: BookOpen },
  { to: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { to: ROUTES.programs, label: "Browse Programs", icon: BookOpen },
  { to: ROUTES.requestCoach, label: "Request Coach", icon: Users },
  { to: ROUTES.dailyLog, label: "Daily Log", icon: ClipboardList },
  { to: ROUTES.progress, label: "Progress", icon: ChartNoAxesCombined },
  { to: ROUTES.aiAssistant, label: "AI Assistant", icon: Bot },
  { to: ROUTES.settings, label: "Settings", icon: Settings },
];

const adminNavItems = [
  { to: "/admin", label: "Dashboard", icon: BarChart3 },
  { to: "/admin/users", label: "Users", icon: Users },
];

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-cyan-200 shadow-lg shadow-cyan-500/10">
        <Dumbbell className="h-5 w-5" />
      </span>
      <div className="leading-tight">
        <p className="font-heading text-sm font-bold uppercase tracking-[0.22em] text-slate-950">
          FitCoach AI
        </p>
        <p className="text-xs font-medium text-slate-500">Live coaching OS</p>
      </div>
    </div>
  );
}

function navClass(isActive: boolean) {
  return cn(
    "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
    isActive
      ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
      : "text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm",
  );
}

export function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/70 bg-white/80 shadow-[18px_0_70px_-55px_rgba(15,23,42,.65)] backdrop-blur-xl lg:flex">
      <div className="flex h-20 items-center border-b border-slate-200/70 px-5">
        <BrandMark />
      </div>
      <nav className="flex-1 space-y-1.5 p-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => navClass(isActive)}
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}

        {user?.role === "admin" && (
          <>
            <div className="mb-1 mt-5 px-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Admin
              </p>
            </div>
            {adminNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => navClass(isActive)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>
      <div className="m-3 rounded-3xl border border-cyan-200/70 bg-cyan-50/70 p-4 text-slate-700">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
          <Sparkles className="h-4 w-4 text-cyan-600" />
          PostgreSQL live
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Dashboard, logs, progress, and AI context are loaded from the real
          database.
        </p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const { user } = useAuth();
  const items =
    user?.role === "admin" ? [...navItems, ...adminNavItems] : navItems;

  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-slate-200/70 bg-white/85 px-3 py-2 shadow-sm backdrop-blur-xl lg:hidden">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold transition",
              isActive
                ? "bg-slate-950 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-white hover:text-slate-950",
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
