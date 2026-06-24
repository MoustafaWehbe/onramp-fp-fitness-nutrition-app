import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

interface StepperProps {
  steps: string[];
  current: number;
}

export const Stepper = ({ steps, current }: StepperProps) => (
  <ol className="flex w-full items-center">
    {steps.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <li
          key={label}
          className={cn(
            "flex items-center",
            i < steps.length - 1 && "flex-1",
          )}
        >
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border text-sm font-bold transition-colors",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-foreground bg-foreground text-background",
                !done && !active && "border-border text-muted-foreground",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-sm font-medium sm:block",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <span
              className={cn(
                "mx-3 h-px flex-1",
                done ? "bg-primary" : "bg-border",
              )}
            />
          )}
        </li>
      );
    })}
  </ol>
);
