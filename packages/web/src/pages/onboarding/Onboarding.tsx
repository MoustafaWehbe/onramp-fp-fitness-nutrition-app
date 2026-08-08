import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "../../hooks/useUserProfile";
import type { Gender, ActivityLevel, FitnessGoal } from "../../lib/api-types";
import { ROUTES } from "../../constants/routes";
import { Button } from "../../components/ui/button";

export const Onboarding = () => {
  const navigate = useNavigate();
  const { profile, isLoading: profileLoading, saveProfile } = useUserProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    age: "",
    gender: "male" as Gender,
    heightCm: "",
    weightKg: "",
    targetWeightKg: "",
    activityLevel: "moderate" as ActivityLevel,
    goal: "lose_weight" as FitnessGoal,
    injuries: "",
    dietaryNotes: "",
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      age: String(profile.age ?? ""),
      gender: profile.gender ?? "male",
      heightCm: String(profile.heightCm ?? ""),
      weightKg: String(profile.weightKg ?? ""),
      targetWeightKg: profile.targetWeightKg != null ? String(profile.targetWeightKg) : "",
      activityLevel: profile.activityLevel ?? "moderate",
      goal: profile.goal ?? "lose_weight",
      injuries: profile.injuries ?? "",
      dietaryNotes: profile.dietaryNotes ?? "",
    });
  }, [profile]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await saveProfile({
        age: Number(form.age),
        gender: form.gender,
        heightCm: Number(form.heightCm),
        weightKg: Number(form.weightKg),
        targetWeightKg: form.targetWeightKg ? Number(form.targetWeightKg) : null,
        activityLevel: form.activityLevel,
        goal: form.goal,
        injuries: form.injuries || null,
        dietaryNotes: form.dietaryNotes || null,
      });
      navigate(ROUTES.requestCoach);
    } catch (err) {
      setError("Failed to save your profile. Please check your details and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (profileLoading) {
    return <p className="p-6 text-muted-foreground">Loading your info...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Your Profile</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          We'll use this to match you with the right coach and plan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Age</span>
            <input
              type="number"
              required
              min={13}
              max={100}
              value={form.age}
              onChange={(e) => update("age", e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-card-foreground"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Gender</span>
            <select
              value={form.gender}
              onChange={(e) => update("gender", e.target.value as Gender)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-card-foreground"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Height (cm)</span>
            <input
              type="number"
              required
              value={form.heightCm}
              onChange={(e) => update("heightCm", e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-card-foreground"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Weight (kg)</span>
            <input
              type="number"
              required
              value={form.weightKg}
              onChange={(e) => update("weightKg", e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-card-foreground"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Target weight (kg)</span>
            <input
              type="number"
              value={form.targetWeightKg}
              onChange={(e) => update("targetWeightKg", e.target.value)}
              placeholder="Optional"
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-card-foreground"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Activity level</span>
            <select
              value={form.activityLevel}
              onChange={(e) => update("activityLevel", e.target.value as ActivityLevel)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-card-foreground"
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Lightly active</option>
              <option value="moderate">Moderately active</option>
              <option value="active">Active</option>
              <option value="very_active">Very active</option>
            </select>
          </label>
        </div>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-foreground">Goal</span>
          <select
            value={form.goal}
            onChange={(e) => update("goal", e.target.value as FitnessGoal)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-card-foreground"
          >
            <option value="lose_weight">Lose weight</option>
            <option value="gain_muscle">Gain muscle</option>
            <option value="maintain">Maintain</option>
            <option value="improve_endurance">Improve endurance</option>
            <option value="general_health">General health</option>
          </select>
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-foreground">Injuries or limitations</span>
          <textarea
            value={form.injuries}
            onChange={(e) => update("injuries", e.target.value)}
            placeholder="e.g. lower back issue, bad left knee — optional"
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-card-foreground"
            rows={2}
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium text-foreground">Dietary notes</span>
          <textarea
            value={form.dietaryNotes}
            onChange={(e) => update("dietaryNotes", e.target.value)}
            placeholder="e.g. vegetarian, lactose intolerant — optional"
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-card-foreground"
            rows={2}
          />
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Continue"}
        </Button>
      </form>
    </div>
  );
};