import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "../../../constants/routes";

export const FinalCta = () => (
  <section className="bg-brand-green py-20 text-[#0c2410] sm:py-24">
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center">
      <h2 className="font-sans text-3xl font-black uppercase leading-[0.95] tracking-tight sm:text-4xl lg:text-5xl">
        Your plan is waiting
      </h2>
      <p className="mt-5 max-w-xl text-base text-[#0c2410]/75 sm:text-lg">
        Create an account, pick a program, and log your first day. The coach
        gets sharper with every day you track.
      </p>
      <Link
        to={ROUTES.register}
        className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-ink px-8 py-4 font-heading text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-ink-700"
      >
        Get started free
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  </section>
);
