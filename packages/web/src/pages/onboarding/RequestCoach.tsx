import { useState } from "react";
import { useCoachRequest } from "../../hooks/useCoachRequest";
import { useCoaches } from "../../hooks/useCoaches";
import { UserCheck, Clock, CheckCircle2 } from "lucide-react";

export function RequestCoach() {
  const { request, isLoading: requestLoading, requestCoach } = useCoachRequest();
  const { coaches, isLoading: coachesLoading } = useCoaches();
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

      {coaches.length === 0 ? (
        <p className="text-sm text-muted-foreground">No coaches are available right now.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {coaches.map((coach) => (
            <button
              key={coach.id}
              onClick={() => setSelectedCoachId(coach.id)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                selectedCoachId === coach.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:bg-secondary"
              }`}
            >
              <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                <UserCheck className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-card-foreground text-sm">{coach.name}</p>
                <p className="truncate text-xs text-muted-foreground">{coach.email}</p>
              </div>
            </button>
          ))}
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