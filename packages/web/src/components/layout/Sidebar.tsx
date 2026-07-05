import { NavLink } from "react-router-dom";
import { LayoutDashboard, Settings, CalendarDays, ClipboardList, Bot, ChartNoAxesCombined, BookOpen, Users, BarChart3 } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";

const navItems = [
  { to: ROUTES.dashboard,   label: "Dashboard",       icon: LayoutDashboard },
  { to: ROUTES.programs,    label: "Browse Programs", icon: BookOpen },
  { to: ROUTES.myPlan,      label: "My Plan",         icon: CalendarDays },
  { to: ROUTES.dailyLog,    label: "Daily Log",       icon: ClipboardList },
  { to: ROUTES.progress,    label: "Progress",        icon: ChartNoAxesCombined },
  { to: ROUTES.aiAssistant, label: "AI Assistant",    icon: Bot },
  { to: ROUTES.settings,    label: "Settings",        icon: Settings },
];

const adminNavItems = [
  { to: "/admin",       label: "Dashboard", icon: BarChart3 },
  { to: "/admin/users", label: "Users",     icon: Users },
];

export function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="flex w-60 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-6">
        <span className="font-semibold">Starter Kit</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}

        {user?.role === "admin" && (
          <>
            <div className="mt-4 mb-1 px-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Admin
              </p>
            </div>
            {adminNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}