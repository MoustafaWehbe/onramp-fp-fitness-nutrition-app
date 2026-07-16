import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";
import { Button } from "../../components/ui/button";
import { AuthField } from "./AuthField";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? ROUTES.dashboard;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted, touchedFields },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const shouldShowError = (field: keyof LoginFormData) =>
    isSubmitted || Boolean(touchedFields[field]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch {
      setError("That email and password don't match. Try again.");
    }
  };

  return (
    <div>
      <p className="eyebrow text-primary">Welcome back</p>
      <h1 className="mt-3 font-display text-5xl uppercase leading-none tracking-tight">
        Sign in
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Pick up where you left off and keep your streak going.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        {error && (
          <p className="border-l-2 border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <AuthField
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          error={shouldShowError("email") ? errors.email?.message : undefined}
          {...register("email")}
        />
        <AuthField
          id="password"
          type="password"
          label="Password"
          placeholder="********"
          autoComplete="current-password"
          error={shouldShowError("password") ? errors.password?.message : undefined}
          {...register("password")}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="group h-12 w-full gap-2 font-heading text-sm font-semibold uppercase tracking-wide hover:bg-brand-green-dark"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
          {!isSubmitting && (
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          )}
        </Button>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        New to FitCoach AI?{" "}
        <Link
          to={ROUTES.register}
          className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
};
