import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "../../../constants/routes";

export const Hero = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate(ROUTES.register, { state: { email } });
  };

  return (
    <section className="relative isolate flex min-h-screen w-full items-end overflow-hidden">
      <img
        src="/images/banner-image.jpg"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-black/70 via-black/25 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-brand-green-dark/20 mix-blend-multiply" />

      <div className="mx-auto w-full max-w-7xl px-6 pb-8 pt-28 sm:pb-10 sm:pt-32 min-[2100px]:pb-16">
        <div className="max-w-xl animate-fade-up sm:max-w-2xl">
          <h1 className="font-sans text-4xl font-black uppercase leading-[0.95] tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl min-[2100px]:text-7xl">
            Train with a coach
            <span className="block text-brand-green">that knows you</span>
          </h1>

          <p className="mt-5 max-w-md text-base text-white/85 drop-shadow sm:mt-6 sm:max-w-lg sm:text-lg min-[2100px]:text-xl">
            Skip the generic plan apps. Pick a ready-made program, log what you
            really do, and let an AI that sees your full history coach every meal
            and workout.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-7 flex max-w-lg flex-col gap-3 sm:mt-8 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              aria-label="Email address"
              className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-5 py-4 text-sm text-white backdrop-blur placeholder:text-white/60 focus:border-brand-green focus:outline-none"
            />
            <button
              type="submit"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-brand-green px-7 py-4 font-heading text-sm font-semibold uppercase tracking-wide text-[#0c2410] transition-colors hover:bg-white"
            >
              Start free trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <Link
            to={ROUTES.programs}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            or browse the program catalog
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
