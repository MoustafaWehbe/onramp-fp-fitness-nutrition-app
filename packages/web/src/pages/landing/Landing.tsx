import { Hero } from "./sections/Hero";
import { Marquee } from "./sections/Marquee";
import { Solution } from "./sections/Solution";
import { HowItWorks } from "./sections/HowItWorks";
import { FeaturedPrograms } from "./sections/FeaturedPrograms";
import { AICoach } from "./sections/AICoach";
import { FinalCta } from "./sections/FinalCta";

export const Landing = () => (
  <>
    <Hero />
    <Marquee />
    <Solution />
    <HowItWorks />
    <FeaturedPrograms />
    <AICoach />
    <FinalCta />
  </>
);
