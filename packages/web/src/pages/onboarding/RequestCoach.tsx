import { useState } from "react";
import { useCoachRequest } from "../../hooks/useCoachRequest";
import { useCoaches } from "../../hooks/useCoaches";
import { useUserProfile } from "../../hooks/useUserProfile";
import { UserCheck, Clock, CheckCircle2, Star, Award, Users } from "lucide-react";

export function RequestCoach() {
  const { request, isLoading: requestLoading, requestCoach } = useCoachRequest();
  const { coaches, isLoading: coachesLoading } = useCoaches();
  const { profile } = useUserProfile();
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequest() {
    if (!selectedCoachId) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await requestCoach(selectedCoachId, message || undefined);
    } catch (err) {
      setError("Could not send your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (requestLoading || coachesLoading) {
    return <p className="p-6 text-muted-foreground">Loading...</p>;
  }

  if (request && request.status !== "rejected") {
    return (
      <div className="mx-auto max-w-md space-y-4 p-6 text-center">
        {request.status === "pending" && (
          <>
            <Clock className="mx-auto h-10 w-10 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Request sent</h1>
            <p className="text-sm text-muted-foreground">
              {request.coach?.name ?? "Your coach"} will review your profile and build your plan soon.
            </p>
          </>
        )}
        {(request.status === "accepted" || request.status === "completed") && (
          <>
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
            <h1 className="text-xl font-bold text-foreground">A coach is on it</h1>
            <p className="text-sm text-muted-foreground">
              {request.coach?.name ?? "Your coach"} is preparing your plan. Check My Plan soon.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Request a Coach</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Pick a coach to build your workout and meal plan based on your profile.
        </p>
      </div>

      {/* ── Your profile summary ── */}
      {profile ? (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your Profile
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Goal</p>
              <p className="text-sm font-semibold capitalize text-card-foreground">
                {profile.goal.replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Activity</p>
              <p className="text-sm font-semibold capitalize text-card-foreground">
                {profile.activityLevel.replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Height / Weight</p>
              <p className="text-sm font-semibold text-card-foreground">
                {profile.heightCm}cm · {profile.weightKg}kg
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Age</p>
              <p className="text-sm font-semibold text-card-foreground">{profile.age}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
          You haven't completed your profile yet — coaches will see this info too.{" "}
          <a href="/onboarding" className="font-semibold text-primary underline">
            Complete it now
          </a>
        </div>
      )}

      {/* ── Coach cards ── */}
      {coaches.length === 0 ? (
        <p className="text-sm text-muted-foreground">No coaches are available right now.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {coaches.map((coach) => {
            const cp = coach.coachProfile;
            const selected = selectedCoachId === coach.id;
            return (
              <button
                key={coach.id}
                onClick={() => setSelectedCoachId(coach.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  selected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:bg-secondary"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                    <UserCheck className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-card-foreground text-sm">{coach.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {cp?.title ?? "Fitness Coach"}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      {cp?.rating != null && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-primary text-primary" /> {cp.rating.toFixed(1)}
                        </span>
                      )}
                      {cp?.yearsExperience != null && (
                        <span className="flex items-center gap-1">
                          <Award className="h-3 w-3" /> {cp.yearsExperience}y exp
                        </span>
                      )}
                      {cp?.clientsCount != null && cp.clientsCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {cp.clientsCount} clients
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {cp?.bio && (
                  <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{cp.bio}</p>
                )}

                {cp?.specialties && cp.specialties.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {cp.specialties.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="max-w-xl space-y-3">
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-foreground">Message (optional)</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Anything specific you want your coach to know?"
            rows={3}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-card-foreground"
          />
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          onClick={handleRequest}
          disabled={!selectedCoachId || isSubmitting}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {isSubmitting ? "Sending..." : "Request This Coach"}
        </button>
      </div>
    </div>
  );
}