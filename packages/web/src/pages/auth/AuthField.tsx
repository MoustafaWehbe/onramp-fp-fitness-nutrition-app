import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { Input, type InputProps } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export interface AuthFieldProps extends InputProps {
  label: string;
  error?: string;
  hint?: string;
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ label, error, hint, id, className, ...props }, ref) => (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="font-heading text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        {label}
      </Label>
      <Input
        id={id}
        ref={ref}
        aria-invalid={!!error}
        className={cn(
          "h-11",
          error && "border-destructive focus-visible:ring-destructive",
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  ),
);
AuthField.displayName = "AuthField";
