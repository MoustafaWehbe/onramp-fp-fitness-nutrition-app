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
import { Progress } from "../pages/progress/Progress";
import { AIAssistant } from "../pages/ai-assistant/AIAssistant";
import { BrowsePrograms } from "../pages/programs/BrowsePrograms";
import { ProgramDetail } from "../pages/programs/ProgramDetail";
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
        <Route path={ROUTES.progress} element={<Progress />} />
        <Route path={ROUTES.aiAssistant} element={<AIAssistant />} />
        <Route path={ROUTES.settings} element={<Settings />} />
        <Route path={ROUTES.programs} element={<BrowsePrograms />} />
        <Route path={ROUTES.programDetail()} element={<ProgramDetail />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);
