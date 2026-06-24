import { LANDING_SECTIONS } from "../../../constants/routes";
import { HOW_STEPS } from "../landing.data";

export const HowItWorks = () => (
  <section
    id={LANDING_SECTIONS.how.replace("#", "")}
    className="bg-background py-24"
  >
    <div className="mx-auto w-full max-w-7xl px-6">
      <div className="mb-14 max-w-2xl">
        <p className="eyebrow text-muted-foreground">How it works</p>
        <h2 className="mt-3 font-display text-4xl uppercase tracking-tight sm:text-5xl">
          Three steps to a plan that adapts
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {HOW_STEPS.map((step, i) => (
          <div
            key={step.title}
            className="clip-slant border border-border bg-card p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center bg-ink text-primary">
              <step.icon className="h-6 w-6" />
            </div>
            <div className="mt-6 font-display text-5xl text-muted/60">
              0{i + 1}
            </div>
            <h3 className="mt-2 font-heading text-xl font-bold uppercase">
              {step.title}
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
