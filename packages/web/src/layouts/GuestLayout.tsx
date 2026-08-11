import { Link, NavLink, Outlet } from "react-router-dom";
import {
  ROUTES,
  GUEST_NAV_LINKS,
  GUEST_FOOTER_LINKS,
} from "../constants/routes";

export const GuestLayout = () => (
  <div className="flex min-h-screen flex-col bg-background font-sans">
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 flex h-16 w-[min(100%-2rem,80rem)] items-center justify-between rounded-xl border border-white/10 bg-black/30 px-5 backdrop-blur-xl sm:px-6">
        <Link to={ROUTES.landing} className="flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt=""
            className="h-9 w-9 object-contain"
          />
          <span className="font-heading text-lg font-bold uppercase tracking-wider text-white">
            FitCoach
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {GUEST_NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-heading text-sm font-medium uppercase tracking-wide text-white/70 transition-colors hover:text-brand-green"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <NavLink
            to={ROUTES.login}
            className="hidden font-heading text-sm font-medium uppercase tracking-wide text-white/70 transition-colors hover:text-white sm:block"
          >
            Sign in
          </NavLink>
          <Link
            to={ROUTES.register}
            className="rounded-xl bg-brand-green px-5 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide text-[#0c2410] transition-colors hover:bg-white"
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
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <Link to={ROUTES.landing} className="flex items-center gap-2 text-white">
          <img
            src="/images/logo.png"
            alt=""
            className="h-7 w-7 object-contain"
          />
          <span className="font-heading text-base font-bold uppercase tracking-wider">
            FitCoach
          </span>
        </Link>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-heading text-sm uppercase tracking-wide">
          {GUEST_FOOTER_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-brand-green"
            >
              {l.label}
            </a>
          ))}
          <Link
            to={ROUTES.login}
            className="transition-colors hover:text-brand-green"
          >
            Sign in
          </Link>
        </nav>

        <p className="text-sm">
          &copy; {new Date().getFullYear()} FitCoach
        </p>
      </div>
    </footer>
  </div>
);
