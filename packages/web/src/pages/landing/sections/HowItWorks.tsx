import { LANDING_SECTIONS } from "../../../constants/routes";
import { HOW_STEPS } from "../landing.data";

export const HowItWorks = () => (
  <section
    id={LANDING_SECTIONS.how.replace("#", "")}
    className="border-t border-border bg-secondary py-24 sm:py-28"
  >
    <div className="mx-auto w-full max-w-7xl px-6">
      <div className="max-w-2xl">
        <p className="eyebrow text-muted-foreground">How it works</p>
        <h2 className="mt-3 font-sans text-3xl font-black uppercase leading-[0.95] tracking-tight text-ink sm:text-4xl lg:text-5xl">
          Three steps,
          <span className="block text-brand-green-dark">then just show up</span>
        </h2>
      </div>

      <ol className="mt-14 grid gap-6 md:grid-cols-3">
        {HOW_STEPS.map((step, i) => (
          <li
            key={step.title}
            className="group rounded-xl border border-border bg-card p-8 transition-colors hover:border-brand-green"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-brand-green transition-colors group-hover:bg-brand-green group-hover:text-[#0c2410]">
                <step.icon className="h-6 w-6" aria-hidden />
              </span>
              <span className="font-sans text-4xl font-black tracking-tight text-muted-foreground/40">
                0{i + 1}
              </span>
            </div>
            <h3 className="mt-6 font-heading text-xl font-bold uppercase tracking-wide text-ink">
              {step.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
