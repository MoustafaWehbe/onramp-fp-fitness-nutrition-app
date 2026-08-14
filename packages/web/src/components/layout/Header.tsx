import { LogOut, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center gap-4 border-b border-slate-200/70 bg-white/85 px-4 text-slate-950 shadow-sm backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <img
          src="/images/logo.png"
          alt=""
          className="h-9 w-9 object-contain"
        />
        <span className="font-heading text-sm font-bold uppercase tracking-[0.2em]">
          FitCoach
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2 text-sm text-slate-500">
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">{user?.name}</span>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </header>
  );
}
