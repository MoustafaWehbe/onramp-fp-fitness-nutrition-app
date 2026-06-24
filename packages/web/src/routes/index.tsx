import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppLayout } from "../layouts/AppLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { GuestLayout } from "../layouts/GuestLayout";
import { ROUTES } from "../constants/routes";
import { Landing } from "../pages/landing/Landing";
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import { Dashboard } from "../pages/dashboard/Dashboard";
import { Settings } from "../pages/dashboard/Settings";
import { BrowsePrograms } from "../pages/programs/BrowsePrograms";
import { NotFound } from "../pages/NotFound";

export const AppRoutes = () => (
  <Routes>
    <Route element={<GuestLayout />}>
      <Route path={ROUTES.landing} element={<Landing />} />
    </Route>

    <Route element={<AuthLayout />}>
      <Route path={ROUTES.login} element={<Login />} />
      <Route path={ROUTES.register} element={<Register />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path={ROUTES.dashboard} element={<Dashboard />} />
        <Route path={ROUTES.settings} element={<Settings />} />
        <Route path={ROUTES.programs} element={<BrowsePrograms />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);
