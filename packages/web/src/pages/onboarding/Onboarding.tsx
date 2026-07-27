import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Dumbbell } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { usePreferences } from "../../hooks/usePreferences";
import {
  GOAL_OPTIONS,
  LEVEL_OPTIONS,
  ONBOARDING_STEP_LABELS,
} from "../../constants/onboarding";
import { Stepper } from "../../components/ui/stepper";
import { Button } from "../../components/ui/button";
import { ChoiceStep } from "./ChoiceStep";

export const Onboarding = () => {
  const navigate = useNavigate();
  const { preferences, update } = usePreferences();
  const [step, setStep] = useState(0);

  const isGoalStep = step === 0;
  const canContinue = isGoalStep
    ? preferences.goal !== null
    : preferences.level !== null;

  const handleNext = () => {
    if (isGoalStep) {
      setStep(1);
      return;
    }
    update({ completed: true });
    navigate(ROUTES.dashboard);
  };

  const handleBack = () => setStep(0);

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <header className="flex items-center justify-between px-6 py-6 sm:px-12">
        <Link to={ROUTES.landing} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center bg-primary text-ink">
            <Dumbbell className="h-5 w-5" />
          </span>
          <span className="font-heading text-lg font-bold uppercase tracking-wider">
            FitCoach
          </span>
        </Link>
        <Link
          to={ROUTES.dashboard}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Skip for now
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-12">
        <Stepper steps={ONBOARDING_STEP_LABELS} current={step} />

        <div className="mt-10 animate-fade-up motion-reduce:animate-none">
          {isGoalStep ? (
            <ChoiceStep
              eyebrow="Step 1"
              title="What's your main goal?"
              subtitle="We'll use this to match you with the right programs."
              options={GOAL_OPTIONS}
              value={preferences.goal}
              onSelect={(goal) => update({ goal })}
            />
          ) : (
            <ChoiceStep
              eyebrow="Step 2"
              title="What's your experience level?"
              subtitle="This tunes the intensity of your recommended plans."
              options={LEVEL_OPTIONS}
              value={preferences.level}
              onSelect={(level) => update({ level })}
            />
          )}
        </div>

        <div className="mt-10 flex items-center justify-between">
          {isGoalStep ? (
            <span />
          ) : (
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canContinue}
            className="gap-2 font-heading text-sm font-semibold uppercase tracking-wide"
          >
            {isGoalStep ? "Continue" : "Finish"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};
