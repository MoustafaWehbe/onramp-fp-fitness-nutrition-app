import { Link, NavLink, Outlet } from "react-router-dom";
import {
  ROUTES,
  GUEST_NAV_LINKS,
  GUEST_FOOTER_LINKS,
} from "../constants/routes";

export const GuestLayout = () => (
  <div className="flex min-h-screen flex-col bg-background font-sans">
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 flex h-16 w-[min(100%-2rem,80rem)] items-center justify-between rounded-2xl border border-white/20 bg-gradient-to-r from-blue-600/30 via-sky-500/20 to-cyan-400/15 px-5 shadow-lg shadow-blue-950/10 backdrop-blur-xl sm:px-6">
        <Link to={ROUTES.landing} className="flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt=""
            className="h-9 w-9 object-contain drop-shadow"
          />
          <span className="font-sans text-lg font-bold uppercase tracking-wider text-white drop-shadow pt-[3px]">
            FitCoach<span className="text-brand-green"> AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {GUEST_NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-sans text-sm font-medium uppercase tracking-wide text-white/80 drop-shadow transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <NavLink
            to={ROUTES.login}
            className="hidden font-sans text-sm font-medium uppercase tracking-wide text-white/90 drop-shadow transition-colors hover:text-white sm:block"
          >
            Sign in
          </NavLink>
          <Link
            to={ROUTES.register}
            className="rounded-full bg-brand-green px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wide text-[#0c2410] shadow-lg transition-colors hover:bg-white"
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
          <img
            src="/images/logo.png"
            alt=""
            className="h-6 w-6 object-contain"
          />
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
