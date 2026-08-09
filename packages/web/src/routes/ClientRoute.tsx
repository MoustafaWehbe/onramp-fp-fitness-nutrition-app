import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";

/**
 * Following a plan, logging meals and requesting a coach are all things a
 * client does. Hiding the nav is not enough — the URLs are still typeable.
 */
export const ClientRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to={ROUTES.login} replace />;
  if (user.role === "coach") return <Navigate to={ROUTES.coachPrograms} replace />;

  return <Outlet />;
};
