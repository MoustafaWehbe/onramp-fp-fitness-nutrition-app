import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

export const GoogleSignInButton = ({
  onError,
}: {
  onError: (message: string) => void;
}) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? ROUTES.dashboard;

  return (
    <>
      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="mt-6 flex justify-center">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              await loginWithGoogle(credentialResponse.credential!);
              navigate(from, { replace: true });
            } catch {
              onError("Google sign-in failed. Try again.");
            }
          }}
          onError={() => onError("Google sign-in failed. Try again.")}
        />
      </div>
    </>
  );
};