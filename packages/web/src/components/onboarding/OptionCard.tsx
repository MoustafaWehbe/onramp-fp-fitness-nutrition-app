import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface OptionCardProps {
  label: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: () => void;
}

export const OptionCard = ({
  label,
  description,
  icon: Icon,
  selected,
  onSelect,
}: OptionCardProps) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onSelect}
    className={cn(
      "group flex items-start gap-4 rounded-lg border p-5 text-left transition-colors",
      selected
        ? "border-primary bg-primary/5"
        : "border-border hover:border-primary/60",
    )}
  >
    <span
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-md border transition-colors",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground group-hover:text-foreground",
      )}
    >
      <Icon className="h-5 w-5" />
    </span>
    <span>
      <span className="block font-heading text-sm font-bold uppercase tracking-wide">
        {label}
      </span>
      <span className="mt-1 block text-sm text-muted-foreground">
        {description}
      </span>
    </span>
  </button>
);
