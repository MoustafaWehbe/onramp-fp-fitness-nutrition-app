import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bot,
  BrainCircuit,
  ClipboardCheck,
  Clock,
  Dumbbell,
  MessageCircle,
  RefreshCw,
  Send,
  Sparkles,
  Target,
  User,
  Zap,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  type DailyLog,
  type FitnessPlan,
} from "../../lib/fitness-types";
import {
  fetchFitnessSummary,
  sendFitnessChatMessage,
  type FitnessChatMessage,
} from "../../lib/fitness-api";
import { cn } from "../../lib/utils";

type ChatMessage = FitnessChatMessage;

const panelClass =
  "border-white/60 bg-white/80 shadow-[0_24px_80px_-45px_rgba(30,41,59,0.55)] backdrop-blur-xl";
const motionStyles = `
  @keyframes dev3-float {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    50% { transform: translate3d(-18px, -14px, 0) scale(1.05); }
  }
  @keyframes dev3-drift {
    0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: .5; }
    50% { transform: translate3d(-18px, -22px, 0) rotate(-12deg); opacity: .95; }
  }
  @keyframes dev3-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes dev3-pulse-ring {
    0% { transform: scale(.92); opacity: .75; }
    70%, 100% { transform: scale(1.25); opacity: 0; }
  }
  @keyframes dev3-dot {
    0%, 80%, 100% { transform: translateY(0); opacity: .38; }
    40% { transform: translateY(-5px); opacity: 1; }
  }
  @keyframes dev3-wave {
    from { transform: scaleY(.3); opacity: .45; }
    to { transform: scaleY(1); opacity: 1; }
  }
  @keyframes dev3-scan {
    0% { transform: translateX(-110%); opacity: 0; }
    35%, 70% { opacity: 1; }
    100% { transform: translateX(110%); opacity: 0; }
  }
  .dev3-float { animation: dev3-float 11s ease-in-out infinite; }
  .dev3-drift { animation: dev3-drift 12s ease-in-out infinite; }
  .dev3-fade-up { animation: dev3-fade-up .72s cubic-bezier(.2,.8,.2,1) both; }
  .dev3-card { transition: transform .24s ease, box-shadow .24s ease, border-color .24s ease; }
  .dev3-card:hover { transform: translateY(-4px); box-shadow: 0 28px 80px -46px rgba(15, 23, 42, .92); }
  .dev3-dot { animation: dev3-dot 1.1s ease-in-out infinite; }
  .dev3-wave { transform-origin: center; animation: dev3-wave .9s ease-in-out infinite alternate; }
  .dev3-ring::before, .dev3-ring::after {
    content: "";
    position: absolute;
    inset: -7px;
    border-radius: 9999px;
    border: 1px solid rgba(103, 232, 249, .4);
    animation: dev3-pulse-ring 2.4s ease-out infinite;
  }
  .dev3-ring::after { animation-delay: .9s; }
  .dev3-scan::after {
    content: "";
    position: absolute;
    inset-block: 0;
    width: 45%;
    background: linear-gradient(90deg, transparent, rgba(125, 211, 252, .22), transparent);
    animation: dev3-scan 4.6s ease-in-out infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .dev3-float, .dev3-drift, .dev3-fade-up, .dev3-dot, .dev3-wave, .dev3-ring::before, .dev3-ring::after, .dev3-scan::after {
      animation: none !important;
      transform: none !important;
    }
    .dev3-card, .dev3-card:hover { transition: none !important; transform: none !important; }
  }
`;

const suggestedQuestions = [
  "How should I adjust dinner today?",
  "Am I on track with protein?",
  "What workout should I prioritize next?",
  "Summarize this week's progress.",
];
const emptyPlan: FitnessPlan = {
  id: "",
  name: "No active program",
  focus: "",
  calorieTarget: 0,
  proteinTarget: 0,
  workoutTargetPerWeek: 0,
};

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatChatTime(value?: string): string {
  if (!value) return "now";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AiContextIllustration() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(34,211,238,.28),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(167,139,250,.30),transparent_34%)]" />
      <svg viewBox="0 0 520 260" className="absolute inset-0 h-full w-full" role="img" aria-label="AI coaching context illustration">
        <defs>
          <linearGradient id="aiWire" x1="0" x2="1">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <path d="M78 178 C142 80 232 218 306 118 C356 52 414 74 462 42" fill="none" stroke="url(#aiWire)" strokeWidth="7" strokeLinecap="round" opacity=".82" />
        {[92, 206, 314, 438].map((x, index) => (
          <g key={x} className="dev3-float" style={{ animationDelay: `${index * -1.2}s` }}>
            <circle cx={x} cy={[170, 186, 116, 50][index]} r="28" fill="rgba(15,23,42,.48)" stroke="rgba(255,255,255,.18)" />
            <circle cx={x} cy={[170, 186, 116, 50][index]} r="8" fill={index % 2 ? "#a78bfa" : "#67e8f9"} />
          </g>
        ))}
        <rect x="286" y="146" width="152" height="62" rx="24" fill="rgba(255,255,255,.10)" stroke="rgba(255,255,255,.18)" />
        <path d="M316 176 h78 M316 194 h48" stroke="rgba(255,255,255,.68)" strokeWidth="7" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function getApiErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  ) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) return response.data.error;
  }

  if (error instanceof Error) return error.message;
  return "The assistant could not connect to the coaching API. Please try again after the API is available.";
}

export function AIAssistant() {
  const [dataSource, setDataSource] = useState<"database" | "unavailable">(
    "unavailable",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [plan, setPlan] = useState<FitnessPlan>(emptyPlan);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  function loadAssistantContext(): () => void {
    let cancelled = false;
    setIsLoading(true);
    setAssistantError(null);
    fetchFitnessSummary()
      .then((summary) => {
        if (cancelled) return;
        setDataSource("database");
        setPlan(summary.activePlan);
        setLogs(summary.dailyLogs);
        if (summary.chatMessages.length > 0) {
          setMessages(summary.chatMessages);
        } else {
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content: `I am ready to coach from your ${summary.activePlan.name} and saved PostgreSQL logs. Ask about meals, workouts, adherence, or recovery.`,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        setDataSource("unavailable");
        setAssistantError(getApiErrorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }

  useEffect(() => {
    return loadAssistantContext();
  }, []);

  const contextSummary = useMemo(() => {
    const completed = logs.filter((log) => log.workoutCompleted).length;
    const latest = logs[logs.length - 1];
    return latest
      ? `${completed}/${logs.length} workouts logged, latest calories ${latest.calories}`
      : "No daily logs saved yet";
  }, [logs]);

  const contextMetrics = useMemo(() => {
    const completed = logs.filter((log) => log.workoutCompleted).length;
    const latest = logs[logs.length - 1];
    const averageCalories = Math.round(average(logs.map((log) => log.calories)));
    const averageProtein = Math.round(average(logs.map((log) => log.protein)));

    return [
      {
        label: "Training",
        value: logs.length > 0 ? `${completed}/${logs.length}` : "No logs",
        detail: logs.length > 0 ? "workouts logged" : "save a daily log",
        icon: Dumbbell,
      },
      {
        label: "Calories",
        value: averageCalories.toString(),
        detail: `${Math.abs(averageCalories - plan.calorieTarget)} from target`,
        icon: Activity,
      },
      {
        label: "Protein",
        value: `${averageProtein}g`,
        detail: `${Math.abs(averageProtein - plan.proteinTarget)}g from target`,
        icon: ClipboardCheck,
      },
      {
        label: "Latest",
        value: latest ? `${latest.calories}` : "No log",
        detail: latest ? "most recent kcal" : "save a daily log",
        icon: Sparkles,
      },
    ];
  }, [logs, plan.calorieTarget, plan.proteinTarget]);

  function sendMessage(text = input): void {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (dataSource !== "database") {
      setAssistantError(
        "The assistant needs the API and PostgreSQL context before it can answer.",
      );
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setAssistantError(null);
    setIsThinking(true);

    void sendFitnessChatMessage(trimmed)
      .then((apiMessages) => {
        setMessages((current) => [
          ...current.filter((message) => message.id !== userMessage.id),
          ...apiMessages,
        ]);
      })
      .catch((error) => {
        setAssistantError(getApiErrorMessage(error));
      })
      .finally(() => {
        setIsThinking(false);
      });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    sendMessage();
  }

  return (
    <div className="relative -m-6 min-h-[calc(100vh-3.5rem)] overflow-hidden bg-[radial-gradient(circle_at_12%_8%,rgba(56,189,248,0.22),transparent_30%),radial-gradient(circle_at_90%_18%,rgba(168,85,247,0.24),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_50%,#f8fafc_100%)] p-4 text-slate-950 sm:p-6 lg:p-8">
      <style>{motionStyles}</style>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/80 to-transparent" />
      <div className="dev3-float pointer-events-none absolute left-[-5rem] top-12 h-64 w-64 rounded-full bg-sky-300/25 blur-3xl" />
      <div className="dev3-float pointer-events-none absolute right-[-4rem] top-56 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl [animation-delay:-4s]" />
      <div className="dev3-float pointer-events-none absolute bottom-16 left-1/3 h-56 w-56 rounded-full bg-indigo-400/15 blur-3xl [animation-delay:-7s]" />
      <div className="dev3-drift pointer-events-none absolute left-[22%] top-24 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_24px_rgba(103,232,249,.9)]" />
      <div className="dev3-drift pointer-events-none absolute right-[16%] top-36 h-3 w-3 rounded-full bg-violet-300 shadow-[0_0_30px_rgba(196,181,253,.9)] [animation-delay:-4s]" />
      <div className="dev3-drift pointer-events-none absolute bottom-32 right-[38%] h-2 w-2 rounded-full bg-blue-300 shadow-[0_0_22px_rgba(147,197,253,.9)] [animation-delay:-7s]" />
      <div className="relative mx-auto grid max-w-7xl gap-6 xl:grid-cols-[0.9fr_1.35fr]">
        <section className="dev3-fade-up dev3-scan relative overflow-hidden rounded-[2rem] border border-white/60 bg-slate-950 p-5 text-white shadow-[0_30px_100px_-45px_rgba(15,23,42,0.9)] sm:p-7 xl:min-h-[calc(100vh-7.5rem)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.34),transparent_30%),radial-gradient(circle_at_86%_5%,rgba(168,85,247,0.34),transparent_35%)]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-sky-100 backdrop-blur">
                <BrainCircuit className="h-4 w-4" />
                Context-aware coaching
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-medium text-cyan-100 backdrop-blur sm:ml-2">
                <span className={`h-2 w-2 rounded-full ${dataSource === "database" ? "bg-emerald-300" : "bg-amber-300"} ${isLoading ? "animate-pulse" : ""}`} />
                {isLoading
                  ? "Loading context"
                  : dataSource === "database"
                    ? "PostgreSQL memory"
                    : "Database unavailable"}
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  AI Assistant
                </h1>
                <p className="max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  Ask for meal, macro, workout, or recovery guidance using the active plan and recent daily logs.
                </p>
              </div>
              <div className="dev3-float relative min-h-52 overflow-hidden rounded-[1.65rem] border border-white/10 bg-white/10 shadow-[0_25px_80px_-42px_rgba(56,189,248,.9)] backdrop-blur-md [animation-duration:15s]">
                <AiContextIllustration />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/82 via-slate-950/42 to-cyan-950/28" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <div className="relative flex min-h-52 flex-col justify-between p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-3xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-cyan-50 backdrop-blur-md">
                      Real plan context
                    </div>
                    <div className="dev3-ring relative flex h-12 w-12 items-center justify-center rounded-full bg-cyan-300/15 text-cyan-100 backdrop-blur-md">
                      <BrainCircuit className="relative h-5 w-5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] items-end gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-300">AI coaching layer</p>
                      <p className="mt-1 max-w-xs text-sm leading-5 text-slate-100">
                        Reads workouts, meals, measurements, and chat memory before answering.
                      </p>
                    </div>
                    <div className="flex h-12 items-center gap-1 rounded-2xl border border-white/10 bg-white/10 px-3 backdrop-blur-md">
                      {[34, 74, 48, 90, 56].map((height, index) => (
                        <span
                          key={height}
                          className="dev3-wave w-1.5 rounded-full bg-gradient-to-t from-cyan-300 to-violet-300"
                          style={{
                            height: `${height}%`,
                            animationDelay: `${index * 0.12}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {contextMetrics.map((metric) => {
                  const Icon = metric.icon;

                  return (
                    <div
                      key={metric.label}
                      className="dev3-card rounded-3xl border border-white/10 bg-white/[0.08] p-3 backdrop-blur-md"
                    >
                      <div className="mb-3 inline-flex rounded-2xl bg-white/10 p-2 text-cyan-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        {metric.label}
                      </p>
                      <p className="mt-1 text-xl font-semibold">{metric.value}</p>
                      <p className="text-xs text-slate-400">{metric.detail}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white/15 p-3 text-cyan-200">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Active plan</p>
                    <p className="mt-1 font-semibold">{plan.name}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-white/15 p-3 text-violet-200">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Log signal</p>
                    <p className="mt-1 text-sm font-medium text-slate-100">{contextSummary}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50 backdrop-blur-md">
                <Zap className="mb-3 h-5 w-5 text-cyan-200" />
                {isLoading
                  ? "Loading your shared plan, logs, and chat history from the database."
                  : dataSource === "database"
                    ? "Answers are saved to AI chat history and grounded in the shared project database."
                    : "The assistant needs the API and PostgreSQL connection before it can answer."}
              </div>
              {assistantError && dataSource !== "database" && !isLoading && (
                <button
                  type="button"
                  onClick={loadAssistantContext}
                  className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry context
                </button>
              )}
            </div>
          </div>
        </section>

        <Card className={`${panelClass} dev3-fade-up flex min-h-[calc(100vh-7.5rem)] flex-col overflow-hidden rounded-[2rem]`} style={{ animationDelay: "0.12s" }}>
          <CardHeader className="border-b border-white/60 bg-white/60 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white">
                  <MessageCircle className="h-3.5 w-3.5 text-cyan-300" />
                  Coach chat
                </div>
                <CardTitle className="text-2xl text-slate-950">Plan-aware guidance</CardTitle>
                <CardDescription className="mt-2 text-slate-500">
                  {isLoading
                    ? "Connecting to the shared PostgreSQL-backed fitness context."
                    : dataSource === "database"
                      ? "Responses use the shared PostgreSQL-backed fitness plan, logs, and chat history."
                      : "Database-backed assistant context is unavailable right now."}
                </CardDescription>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700">
                <Target className="h-4 w-4" />
                {plan.name}
              </span>
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
            <div className="min-h-[22rem] flex-1 space-y-4 overflow-y-auto rounded-[1.5rem] border border-white/70 bg-gradient-to-b from-white/80 to-slate-50/80 p-3 shadow-inner sm:p-4">
              {messages.map((message) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      isUser ? "justify-end" : "justify-start",
                    )}
                  >
                    {!isUser && (
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
                        <Bot className="h-5 w-5" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[min(760px,88%)] rounded-[1.35rem] px-4 py-3 text-sm leading-6 shadow-sm",
                        isUser
                          ? "break-words rounded-tr-md bg-slate-950 text-white"
                          : "break-words rounded-tl-md border border-slate-200/70 bg-white text-slate-700",
                      )}
                    >
                      {message.content}
                      <div
                        className={cn(
                          "mt-2 flex items-center gap-1 text-[11px]",
                          isUser ? "text-slate-300" : "text-slate-400",
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        {formatChatTime(message.createdAt)}
                      </div>
                    </div>
                    {isUser && (
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white text-slate-700 shadow-sm">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                );
              })}
              {isThinking && (
                <div className="flex justify-start gap-3">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="rounded-[1.35rem] rounded-tl-md border border-slate-200/70 bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm">
                    <span className="mr-3 align-middle">Thinking with your plan context</span>
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="dev3-dot ml-1 inline-block h-2 w-2 rounded-full bg-indigo-500 align-middle"
                        style={{ animationDelay: `${dot * 0.14}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {assistantError && !isThinking && (
                <div className="flex justify-start gap-3">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 shadow-sm">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="max-w-[min(760px,88%)] break-words rounded-[1.35rem] rounded-tl-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700 shadow-sm">
                    {assistantError}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[1.35rem] border border-white/70 bg-white/65 p-3 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                Suggested prompts
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question)}
                    disabled={isThinking || dataSource !== "database"}
                    className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-2 rounded-[1.5rem] border border-white/70 bg-white/85 p-2 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.8)] ring-1 ring-white/70 sm:flex-row"
            >
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about your calories, macros, workouts, or recovery..."
                disabled={dataSource !== "database"}
                className="min-h-12 flex-1 rounded-2xl border-transparent bg-transparent px-4 shadow-none focus-visible:ring-indigo-300"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isThinking || dataSource !== "database"}
                className="min-h-12 rounded-2xl bg-slate-950 px-5 text-white shadow-lg shadow-slate-950/20 hover:bg-slate-800"
              >
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
