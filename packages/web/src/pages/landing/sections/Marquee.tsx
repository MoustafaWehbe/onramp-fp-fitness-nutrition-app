import { Fragment } from "react";
import { MARQUEE_ITEMS } from "../landing.data";

export const Marquee = () => (
  <section className="bg-primary py-6 text-ink">
    <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-2 px-6 font-heading text-sm font-semibold uppercase tracking-widest">
      {MARQUEE_ITEMS.map((item, i) => (
        <Fragment key={item}>
          {i > 0 && <span className="text-ink/40">/</span>}
          <span>{item}</span>
        </Fragment>
      ))}
    </div>
  </section>
);
