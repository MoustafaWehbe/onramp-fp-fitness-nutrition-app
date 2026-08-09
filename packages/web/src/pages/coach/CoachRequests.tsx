import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Inbox, UserRound, X } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { useCoachRequests } from "../../hooks/useCoachRequests";
import { apiErrorMessage } from "../../lib/api-error";
import type { ApiCoachRequestWithClient } from "../../lib/api-types";

const ProfileFacts = ({ request }: { request: ApiCoachRequestWithClient }) => {
  const profile = request.user?.profile;
  if (!profile) {
    return (
      <p className="mt-2 text-xs text-slate-400">
        This client has not filled in their profile yet.
      </p>
    );
  }

  const facts = [
    profile.goal && ["Goal", profile.goal],
    profile.age && ["Age", `${profile.age}`],
    profile.gender && ["Gender", profile.gender],
    profile.heightCm && ["Height", `${profile.heightCm} cm`],
    profile.weightKg && ["Weight", `${profile.weightKg} kg`],
    profile.targetWeightKg && ["Target", `${profile.targetWeightKg} kg`],
    profile.activityLevel && ["Activity", profile.activityLevel],
  ].filter(Boolean) as Array<[string, string]>;

  return (
    <>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="text-slate-400">{label}</dt>
            <dd className="font-medium text-slate-700">{value}</dd>
          </div>
        ))}
      </dl>

      {(profile.injuries || profile.dietaryNotes) && (
        <div className="mt-3 space-y-1 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {profile.injuries && (
            <p>
              <span className="font-semibold">Injuries / conditions:</span>{" "}
              {profile.injuries}
            </p>
          )}
          {profile.dietaryNotes && (
            <p>
              <span className="font-semibold">Dietary notes:</span>{" "}
              {profile.dietaryNotes}
            </p>
          )}
        </div>
      )}
    </>
  );
};

export const CoachRequests = () => {
  const { pending, accepted, isLoading, error, respond } = useCoachRequests();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleRespond = async (
    requestId: string,
    action: "accept" | "decline",
  ) => {
    setBusyId(requestId);
    setActionError(null);
    try {
      await respond(requestId, action);
    } catch (err) {
      setActionError(apiErrorMessage(err, `Could not ${action} the request`));
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) return <p className="p-6 text-slate-500">Loading…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="space-y-8 p-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-slate-950">Requests</h1>
        <p className="mt-1 text-sm text-slate-500">
          Clients asking you to coach them. Accepting one lets you build their
          program.
        </p>
      </header>

      {actionError && <p className="text-sm text-red-600">{actionError}</p>}

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
          <Inbox className="h-4 w-4" />
          Pending ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <p className="text-sm text-slate-500">No pending requests.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((request) => (
              <li
                key={request.id}
                className="rounded-2xl border border-slate-200 bg-white/80 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 font-semibold text-slate-950">
                      <UserRound className="h-4 w-4" />
                      {request.user?.name ?? "Client"}
                    </p>
                    {request.message && (
                      <p className="mt-1 text-sm italic text-slate-600">
                        “{request.message}”
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busyId === request.id}
                      onClick={() => handleRespond(request.id, "accept")}
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={busyId === request.id}
                      onClick={() => handleRespond(request.id, "decline")}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Decline
                    </button>
                  </div>
                </div>

                <ProfileFacts request={request} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-950">
          Accepted ({accepted.length})
        </h2>

        {accepted.length === 0 ? (
          <p className="text-sm text-slate-500">No accepted clients yet.</p>
        ) : (
          <ul className="space-y-2">
            {accepted.map((request) => (
              <li
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
              >
                <span className="font-medium text-slate-900">
                  {request.user?.name ?? "Client"}
                </span>

                {request.program ? (
                  <Link
                    to={ROUTES.coachProgramBuilder(request.program.id)}
                    className="text-xs font-semibold text-slate-600 underline-offset-2 hover:underline"
                  >
                    {request.program.status === "published"
                      ? "View program"
                      : "Continue draft"}
                  </Link>
                ) : (
                  <Link
                    to={`${ROUTES.coachPrograms}?request=${request.id}`}
                    className="text-xs font-semibold text-slate-950 underline-offset-2 hover:underline"
                  >
                    Build program →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
