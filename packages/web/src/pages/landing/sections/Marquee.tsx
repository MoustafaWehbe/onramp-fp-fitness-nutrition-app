import { Fragment } from "react";
import { MARQUEE_ITEMS } from "../landing.data";

export const Marquee = () => (
  <section className="bg-brand-green py-5 text-[#0c2410]">
    <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 font-heading text-sm font-semibold uppercase tracking-wide">
      {MARQUEE_ITEMS.map((item, i) => (
        <Fragment key={item}>
          {i > 0 && (
            <span aria-hidden className="text-[#0c2410]/40">
              /
            </span>
          )}
          <span>{item}</span>
        </Fragment>
      ))}
    </div>
  </section>
);
