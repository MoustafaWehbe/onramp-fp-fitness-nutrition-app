import { Flame, Zap, Target } from "lucide-react";

const INSIGHTS = [
  { icon: Flame, value: "27", unit: "days", label: "Current streak" },
  { icon: Zap, value: "30", unit: "days", label: "Best streak" },
  { icon: Target, value: "7.5", unit: "/8", label: "Daily average" },
];

export const Solution = () => (
  <section className="bg-background py-24">
    <div className="mx-auto w-full max-w-7xl px-6">
      <h2 className="max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
        The complete{" "}
        <span className="font-serif font-medium italic text-brand-green-dark">
          coaching solution
        </span>{" "}
        for health and fitness
      </h2>

      <div className="relative mt-12 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-green-dark via-brand-green-dark to-brand-green p-8 shadow-2xl shadow-brand-green-dark/25 sm:p-16">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-black/20 blur-3xl" />

        <div className="relative mx-auto max-w-2xl rounded-3xl border border-white/25 bg-white/15 p-6 shadow-xl shadow-black/20 backdrop-blur-md sm:p-8">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-green text-lg font-bold text-[#0c2410]">
              JL
            </span>
            <div>
              <p className="text-sm text-white/70">Jordan Lee's goal</p>
              <p className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                Lose 15 lbs before the wedding
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {INSIGHTS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center"
              >
                <s.icon className="mx-auto h-5 w-5 text-brand-green" />
                <p className="mt-2 text-2xl font-bold text-white">
                  {s.value}
                  <span className="text-sm font-medium text-white/60"> {s.unit}</span>
                </p>
                <p className="text-[11px] uppercase tracking-wide text-white/60">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);
