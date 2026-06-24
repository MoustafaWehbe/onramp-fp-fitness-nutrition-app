import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "../../../constants/routes";

export const FinalCta = () => (
  <section className="bg-primary py-20 text-ink">
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center">
      <h2 className="font-display text-5xl uppercase tracking-tight sm:text-6xl">
        Your plan is waiting
      </h2>
      <p className="mt-4 max-w-xl text-ink/80">
        Create an account, pick a program, and start logging today. The coach
        gets smarter with every day you track.
      </p>
      <Link
        to={ROUTES.register}
        className="group mt-8 inline-flex items-center gap-2 bg-ink px-8 py-4 font-heading text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-ink-700"
      >
        Get started free
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  </section>
);
