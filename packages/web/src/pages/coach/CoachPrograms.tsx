import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ClipboardList, Plus, UserRound } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { useCoachPrograms } from "../../hooks/useCoachPrograms";
import { apiErrorMessage } from "../../lib/api-error";
import type { ApiCoachRequestWithClient } from "../../lib/api-types";

const statusBadge = (status: "draft" | "published") =>
  status === "published"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-amber-100 text-amber-700";

const clientSummary = (request: ApiCoachRequestWithClient) => {
  const profile = request.user?.profile;
  if (!profile) return "No profile submitted";
  return [
    profile.goal,
    profile.age ? `${profile.age} yrs` : null,
    profile.weightKg ? `${profile.weightKg} kg` : null,
    profile.injuries ? `Injuries: ${profile.injuries}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
};

export const CoachPrograms = () => {
  const { programs, clients, isLoading, error, createProgram } = useCoachPrograms();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Arriving from "Build program" on the Requests page preselects that client.
  const [selectedRequestId, setSelectedRequestId] = useState(
    searchParams.get("request") ?? "",
  );
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [calories, setCalories] = useState(2000);
  const [startDate, setStartDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const clientsWithoutProgram = clients.filter((request) => !request.program);

  // The id comes from the URL, so it can name a client who already has a
  // program or was never accepted. Left as-is it would sit in state while the
  // select renders blank, and `required` would not stop the submit.
  const effectiveRequestId = clientsWithoutProgram.some(
    (request) => request.id === selectedRequestId,
  )
    ? selectedRequestId
    : "";

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(null);
    try {
      const program = await createProgram({
        coachRequestId: effectiveRequestId,
        title,
        goal,
        level,
        calories,
        ...(startDate ? { startDate } : {}),
      });
      navigate(ROUTES.coachProgramBuilder(program.id));
    } catch (err) {
      setFormError(apiErrorMessage(err, "Could not create the program"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p className="p-6 text-slate-500">Loading…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="space-y-8 p-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-slate-950">
          Client programs
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Build one weekly plan per accepted client, then publish it to their
          My&nbsp;Plan.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white/80 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
          <Plus className="h-4 w-4" />
          New program
        </h2>

        {clientsWithoutProgram.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            Every accepted client already has a program. Accept a new request to
            build another.
          </p>
        ) : (
          <form onSubmit={handleCreate} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
              <span className="font-medium text-slate-700">Client</span>
              <select
                required
                value={effectiveRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              >
                <option value="">Select a client…</option>
                {clientsWithoutProgram.map((request) => (
                  <option key={request.id} value={request.id}>
                    {request.user?.name ?? "Client"} — {clientSummary(request)}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="font-medium text-slate-700">Title</span>
              <input
                required
                minLength={2}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="12-week strength base"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>

            <label className="text-sm">
              <span className="font-medium text-slate-700">Goal</span>
              <input
                required
                minLength={2}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Fat loss"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>

            <label className="text-sm">
              <span className="font-medium text-slate-700">Level</span>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>

            <label className="text-sm">
              <span className="font-medium text-slate-700">Daily calories</span>
              <input
                type="number"
                required
                min={0}
                max={20000}
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>

            <label className="text-sm sm:col-span-2">
              <span className="font-medium text-slate-700">
                Start date <span className="text-slate-400">(defaults to next Monday)</span>
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>

            {formError && (
              <p className="text-sm text-red-600 sm:col-span-2">{formError}</p>
            )}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isSaving ? "Creating…" : "Create draft"}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
          <ClipboardList className="h-4 w-4" />
          Your programs
        </h2>

        {programs.length === 0 ? (
          <p className="text-sm text-slate-500">No programs yet.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {programs.map((program) => (
              <li key={program.id}>
                <Link
                  to={ROUTES.coachProgramBuilder(program.id)}
                  className="block rounded-2xl border border-slate-200 bg-white/80 p-4 transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{program.title}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <UserRound className="h-3.5 w-3.5" />
                        {program.user?.name ?? "Client"} · {program.goal}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge(program.status)}`}
                    >
                      {program.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
