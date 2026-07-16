import { Link, NavLink, Outlet } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import {
  ROUTES,
  GUEST_NAV_LINKS,
  GUEST_FOOTER_LINKS,
} from "../constants/routes";

export const GuestLayout = () => (
  <div className="flex min-h-screen flex-col bg-background font-sans">
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink text-white">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Link to={ROUTES.landing} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center bg-primary text-ink">
            <Dumbbell className="h-5 w-5" />
          </span>
          <span className="font-heading text-lg font-bold uppercase tracking-wider">
            FitCoach<span className="text-primary"> AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {GUEST_NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-heading text-sm font-medium uppercase tracking-wide text-white/70 transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <NavLink
            to={ROUTES.login}
            className="hidden font-heading text-sm font-medium uppercase tracking-wide text-white/80 transition-colors hover:text-white sm:block"
          >
            Sign in
          </NavLink>
          <Link
            to={ROUTES.register}
            className="bg-primary px-4 py-2 font-heading text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-brand-green-dark"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>

    <main className="flex-1">
      <Outlet />
    </main>

    <footer className="border-t border-white/10 bg-ink text-white/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-white">
          <Dumbbell className="h-5 w-5 text-primary" />
          <span className="font-heading font-bold uppercase tracking-wider">
            FitCoach AI
          </span>
        </div>
        <p className="text-sm">
          (c) {new Date().getFullYear()} FitCoach AI. Real coaching data,
          thoughtfully presented.
        </p>
        <div className="flex gap-6 text-sm">
          {GUEST_FOOTER_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-primary">
              {l.label}
            </a>
          ))}
          <Link to={ROUTES.login} className="hover:text-primary">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  </div>
);
