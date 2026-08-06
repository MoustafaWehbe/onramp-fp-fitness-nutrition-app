import { Link, Outlet } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { ROUTES } from "../constants/routes";
import { AuthBrandPanel } from "../pages/auth/AuthBrandPanel";

export const AuthLayout = () => (
  <div className="grid min-h-screen font-sans lg:grid-cols-2">
    <AuthBrandPanel />

    <main className="flex flex-col justify-center bg-background px-6 py-12 sm:px-12">
      <Link to={ROUTES.landing} className="mb-12 flex items-center gap-2 lg:hidden">
        <span className="flex h-8 w-8 items-center justify-center bg-primary text-ink">
          <Dumbbell className="h-5 w-5" />
        </span>
        <span className="font-heading text-lg font-bold uppercase tracking-wider">
          FitCoach
        </span>
      </Link>

      <div className="mx-auto w-full max-w-sm animate-fade-up motion-reduce:animate-none">
        <Outlet />
      </div>
    </main>
  </div>
);
