import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";
import { Button } from "../../components/ui/button";
import { AuthField } from "./AuthField";
import { GoogleSignInButton } from "./GoogleSignInButton";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted, touchedFields },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const shouldShowError = (field: keyof RegisterFormData) =>
    isSubmitted || Boolean(touchedFields[field]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      await registerUser(data.email, data.password, data.name);
      navigate(ROUTES.profile);
    } catch {
      setError("Registration failed. That email may already be in use.");
    }
  };

  return (
    <div>
      <p className="eyebrow text-primary">Start free</p>
      <h1 className="mt-3 font-display text-5xl uppercase leading-none tracking-tight">
        Create account
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Join and get a plan that adapts to what you actually do.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        {error && (
          <p className="border-l-2 border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <AuthField
          id="name"
          label="Name"
          placeholder="Alice Smith"
          autoComplete="name"
          error={shouldShowError("name") ? errors.name?.message : undefined}
          {...register("name")}
        />
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
          autoComplete="new-password"
          hint="At least 8 characters, with an uppercase letter and a number."
          error={shouldShowError("password") ? errors.password?.message : undefined}
          {...register("password")}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="group h-12 w-full gap-2 font-heading text-sm font-semibold uppercase tracking-wide hover:bg-brand-green-dark"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
          {!isSubmitting && (
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          )}
        </Button>
      </form>

      <GoogleSignInButton onError={setError} />

      <p className="mt-8 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to={ROUTES.login}
          className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};