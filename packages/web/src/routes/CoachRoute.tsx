import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";

export const CoachRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to={ROUTES.login} replace />;
  if (user.role !== "coach") return <Navigate to={ROUTES.dashboard} replace />;

  return <Outlet />;
};
