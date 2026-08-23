import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

/** Google renders a fixed-pixel iframe and only honours 200–400. */
const clampWidth = (value: number) =>
  Math.round(Math.min(400, Math.max(200, value)));

export const GoogleSignInButton = ({
  onError,
}: {
  onError: (message: string) => void;
}) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? ROUTES.dashboard;

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    if (typeof ResizeObserver === "undefined") {
      setWidth(clampWidth(element.clientWidth));
      return;
    }
    const observer = new ResizeObserver(([entry]) =>
      setWidth(clampWidth(entry.contentRect.width)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div ref={containerRef} className="mt-6 flex justify-center">
        {width !== null && (
          <GoogleLogin
            width={width}
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
        )}
      </div>
    </>
  );
};
