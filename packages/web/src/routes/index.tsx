import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { UsersList } from "../pages/admin/UsersList";
import { AppLayout } from "../layouts/AppLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { GuestLayout } from "../layouts/GuestLayout";
import { ROUTES } from "../constants/routes";
import { Landing } from "../pages/landing/Landing";
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import { Onboarding } from "../pages/onboarding/Onboarding";
import { Dashboard } from "../pages/dashboard/Dashboard";
import { Settings } from "../pages/dashboard/Settings";
import { Progress } from "../pages/progress/Progress";
import { AIAssistant } from "../pages/ai-assistant/AIAssistant";
import { MyPlan } from "../pages/my-plan/MyPlan";
import { DailyLog } from "../pages/daily-log/DailyLog";
import { BrowsePrograms } from "../pages/programs/BrowsePrograms";
import { ProgramDetail } from "../pages/programs/ProgramDetail";
import { NotFound } from "../pages/NotFound";
import { RequestCoach } from "../pages/onboarding/RequestCoach";



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
        <Route path={ROUTES.profile} element={<Onboarding />} />
        <Route path={ROUTES.requestCoach} element={<RequestCoach />} />

        <Route path={ROUTES.dashboard} element={<Dashboard />} />
        <Route path={ROUTES.progress} element={<Progress />} />
        <Route path={ROUTES.aiAssistant} element={<AIAssistant />} />
        <Route path={ROUTES.myPlan} element={<MyPlan />} />
        <Route path={ROUTES.dailyLog} element={<DailyLog />} />
        <Route path={ROUTES.settings} element={<Settings />} />
        <Route path={ROUTES.programs} element={<BrowsePrograms />} />
        <Route path={ROUTES.programDetail()} element={<ProgramDetail />} />
      </Route>
    </Route>
    
    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
    <Route path="/admin/users" element={<AdminRoute><UsersList /></AdminRoute>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);
