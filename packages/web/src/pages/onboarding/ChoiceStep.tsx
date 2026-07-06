import { OptionCard } from "../../components/onboarding/OptionCard";
import type { ChoiceOption } from "../../constants/onboarding";

interface ChoiceStepProps<T extends string> {
  eyebrow: string;
  title: string;
  subtitle: string;
  options: ChoiceOption<T>[];
  value: T | null;
  onSelect: (value: T) => void;
}

export function ChoiceStep<T extends string>({
  eyebrow,
  title,
  subtitle,
  options,
  value,
  onSelect,
}: ChoiceStepProps<T>) {
  return (
    <div>
      <p className="eyebrow text-primary">{eyebrow}</p>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {options.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            icon={opt.icon}
            selected={value === opt.value}
            onSelect={() => onSelect(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}
