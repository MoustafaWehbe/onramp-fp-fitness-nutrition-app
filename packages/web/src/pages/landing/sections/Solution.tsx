import { SOLUTION_FEATURES } from "../landing.data";

export const Solution = () => (
  <section className="bg-background py-24 sm:py-28">
    <div className="mx-auto w-full max-w-7xl px-6">
      <div className="max-w-2xl">
        <p className="eyebrow text-muted-foreground">Everything in one place</p>
        <h2 className="mt-3 font-sans text-3xl font-black uppercase leading-[0.95] tracking-tight text-ink sm:text-4xl lg:text-5xl">
          The whole plan,
          <span className="block text-brand-green-dark">not just the gym</span>
        </h2>
        <p className="mt-5 text-base text-muted-foreground sm:text-lg">
          Training, food, and the record of what you actually did. Most apps
          give you one of the three.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {SOLUTION_FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-xl border border-border bg-card p-8 transition-colors hover:border-brand-green"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-brand-green transition-colors group-hover:bg-brand-green group-hover:text-[#0c2410]">
              <feature.icon className="h-6 w-6" aria-hidden />
            </span>
            <h3 className="mt-6 font-heading text-xl font-bold uppercase tracking-wide text-ink">
              {feature.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {feature.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
