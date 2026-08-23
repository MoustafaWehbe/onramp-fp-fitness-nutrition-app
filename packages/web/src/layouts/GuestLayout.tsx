import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import {
  ROUTES,
  GUEST_NAV_LINKS,
  GUEST_FOOTER_LINKS,
} from "../constants/routes";

export const GuestLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setIsMenuOpen(false), [location.pathname, location.hash]);

  // The panel covers the page, so a background scroll would move content the
  // reader cannot see.
  useEffect(() => {
    if (!isMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMenuOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <header className="absolute inset-x-0 top-0 z-50">
        <div className="mx-auto mt-4 flex h-16 w-[min(100%-1.5rem,80rem)] items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 backdrop-blur-xl sm:w-[min(100%-2rem,80rem)] sm:px-6">
          <Link to={ROUTES.landing} className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt=""
              className="h-8 w-8 object-contain sm:h-9 sm:w-9"
            />
            <span className="font-heading text-base font-bold uppercase tracking-wider text-white sm:text-lg">
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

          <div className="flex items-center gap-3 sm:gap-5">
            <NavLink
              to={ROUTES.login}
              className="hidden font-heading text-sm font-medium uppercase tracking-wide text-white/70 transition-colors hover:text-white md:block"
            >
              Sign in
            </NavLink>
            <Link
              to={ROUTES.register}
              className="hidden rounded-xl bg-brand-green px-5 py-2.5 font-heading text-sm font-semibold uppercase tracking-wide text-[#0c2410] transition-colors hover:bg-white sm:block"
            >
              Get started
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-controls="guest-mobile-menu"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="-mr-1 flex h-10 w-10 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/10 md:hidden"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" aria-hidden />
              ) : (
                <Menu className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div
            id="guest-mobile-menu"
            className="mx-auto mt-2 w-[min(100%-1.5rem,80rem)] animate-fade-in rounded-xl border border-white/10 bg-black/80 p-4 backdrop-blur-xl motion-reduce:animate-none sm:w-[min(100%-2rem,80rem)] md:hidden"
          >
            <nav className="flex flex-col">
              {GUEST_NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg px-2 py-3 font-heading text-sm font-medium uppercase tracking-wide text-white/80 transition-colors hover:bg-white/10 hover:text-brand-green"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              <Link
                to={ROUTES.login}
                className="rounded-lg px-2 py-3 font-heading text-sm font-medium uppercase tracking-wide text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                to={ROUTES.register}
                className="rounded-xl bg-brand-green px-5 py-3 text-center font-heading text-sm font-semibold uppercase tracking-wide text-[#0c2410] transition-colors hover:bg-white"
              >
                Get started
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 bg-ink text-white/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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

          <p className="text-sm">&copy; {new Date().getFullYear()} FitCoach</p>
        </div>
      </footer>
    </div>
  );
};
