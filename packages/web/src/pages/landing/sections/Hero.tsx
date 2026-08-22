import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "../../../constants/routes";

export const Hero = () => (
  <section className="relative isolate flex min-h-screen w-full items-end overflow-hidden supports-[min-height:100svh]:min-h-svh">
    <img
      src="/images/banner-image.jpg"
      alt=""
      className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
    />
    <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-black/70 via-black/25 to-transparent" />
    <div className="absolute inset-0 -z-10 bg-brand-green-dark/20 mix-blend-multiply" />

    <div className="mx-auto w-full max-w-7xl px-5 pb-10 pt-28 sm:px-6 sm:pb-10 sm:pt-32 min-[2100px]:pb-16">
      <div className="max-w-xl animate-fade-up sm:max-w-2xl">
        <h1 className="font-sans text-[2rem] font-black uppercase leading-[0.95] tracking-tight text-white drop-shadow-lg min-[380px]:text-4xl sm:text-5xl lg:text-6xl min-[2100px]:text-7xl">
          Train with a coach
          <span className="block text-brand-green">that knows you</span>
        </h1>

        <p className="mt-5 max-w-md text-base text-white/85 drop-shadow sm:mt-6 sm:max-w-lg sm:text-lg min-[2100px]:text-xl">
          Skip the generic plan apps. Pick a ready-made program, log what you
          really do, and let an AI that sees your full history coach every meal
          and workout.
        </p>

        <Link
          to={ROUTES.register}
          className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green px-7 py-4 font-heading text-sm font-semibold uppercase tracking-wide text-[#0c2410] transition-colors hover:bg-white min-[380px]:w-auto sm:mt-8"
        >
          Get started free
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  </section>
);
