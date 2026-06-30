import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bot,
  BrainCircuit,
  ClipboardCheck,
  Dumbbell,
  MessageCircle,
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
import { getActivePlan, getDailyLogs } from "../../lib/fitness-mock-data";
import { cn } from "../../lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const storageKey = "fitcoach.aiMessages";
const panelClass =
  "border-white/60 bg-white/80 shadow-[0_24px_80px_-45px_rgba(30,41,59,0.55)] backdrop-blur-xl";

const suggestedQuestions = [
  "How should I adjust dinner today?",
  "Am I on track with protein?",
  "What workout should I prioritize next?",
  "Summarize this week's progress.",
];

function readStoredMessages(): ChatMessage[] | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as ChatMessage[]) : null;
  } catch {
    return null;
  }
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function createAnswer(question: string): string {
  const plan = getActivePlan();
  const logs = getDailyLogs();
  const latestLog = logs[logs.length - 1];
  const averageCalories = Math.round(average(logs.map((log) => log.calories)));
  const averageProtein = Math.round(average(logs.map((log) => log.protein)));
  const workoutsCompleted = logs.filter((log) => log.workoutCompleted).length;
  const calorieDelta = averageCalories - plan.calorieTarget;
  const proteinDelta = averageProtein - plan.proteinTarget;
  const caloriePhrase =
    calorieDelta > 0
      ? `${calorieDelta} kcal above`
      : `${Math.abs(calorieDelta)} kcal below`;
  const proteinPhrase =
    proteinDelta >= 0
      ? `${proteinDelta}g above`
      : `${Math.abs(proteinDelta)}g below`;

  return [
    `Using your ${plan.name} context, your last ${logs.length} logs average ${averageCalories} kcal, which is ${caloriePhrase} the ${plan.calorieTarget} kcal target.`,
    `Protein is averaging ${averageProtein}g, ${proteinPhrase} the ${plan.proteinTarget}g target, and you completed ${workoutsCompleted}/${logs.length} logged workouts.`,
    `For "${question}", I would keep the next meal protein-forward, keep fats moderate, and choose the next planned strength session unless recovery feels limited. Latest note: ${latestLog.note}`,
  ].join(" ");
}

export function AIAssistant() {
  const plan = getActivePlan();
  const logs = getDailyLogs();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = readStoredMessages();
    return (
      stored ?? [
        {
          id: "welcome",
          role: "assistant",
          content: `I am ready to coach from your ${plan.name} and recent daily logs. Ask about meals, workouts, adherence, or recovery.`,
        },
      ]
    );
  });

  const contextSummary = useMemo(() => {
    const completed = logs.filter((log) => log.workoutCompleted).length;
    const latest = logs[logs.length - 1];
    return `${completed}/${logs.length} workouts logged, latest calories ${latest.calories}`;
  }, [logs]);

  const contextMetrics = useMemo(() => {
    const completed = logs.filter((log) => log.workoutCompleted).length;
    const latest = logs[logs.length - 1];
    const averageCalories = Math.round(average(logs.map((log) => log.calories)));
    const averageProtein = Math.round(average(logs.map((log) => log.protein)));

    return [
      {
        label: "Training",
        value: `${completed}/${logs.length}`,
        detail: "workouts logged",
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
        value: `${latest.calories}`,
        detail: "most recent kcal",
        icon: Sparkles,
      },
    ];
  }, [logs, plan.calorieTarget, plan.proteinTarget]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages]);

  function sendMessage(text = input): void {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: createAnswer(trimmed),
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    sendMessage();
  }

  return (
    <div className="relative -m-6 min-h-[calc(100vh-3.5rem)] overflow-hidden bg-[radial-gradient(circle_at_12%_8%,rgba(56,189,248,0.22),transparent_30%),radial-gradient(circle_at_90%_18%,rgba(168,85,247,0.24),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_50%,#f8fafc_100%)] p-4 text-slate-950 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/80 to-transparent" />
      <div className="relative mx-auto grid max-w-7xl gap-6 xl:grid-cols-[0.9fr_1.35fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-slate-950 p-5 text-white shadow-[0_30px_100px_-45px_rgba(15,23,42,0.9)] sm:p-7 xl:min-h-[calc(100vh-7.5rem)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.34),transparent_30%),radial-gradient(circle_at_86%_5%,rgba(168,85,247,0.34),transparent_35%)]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-sky-100 backdrop-blur">
                <BrainCircuit className="h-4 w-4" />
                Context-aware coaching
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  AI Assistant
                </h1>
                <p className="max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  Ask for meal, macro, workout, or recovery guidance using the active plan and recent local logs.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {contextMetrics.map((metric) => {
                  const Icon = metric.icon;

                  return (
                    <div
                      key={metric.label}
                      className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 backdrop-blur-md"
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
                Mock answers stay local and are generated from your selected plan, calorie target, protein target, and daily logs.
              </div>
            </div>
          </div>
        </section>

        <Card className={`${panelClass} flex min-h-[calc(100vh-7.5rem)] flex-col overflow-hidden rounded-[2rem]`}>
          <CardHeader className="border-b border-white/60 bg-white/60 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white">
                  <MessageCircle className="h-3.5 w-3.5 text-cyan-300" />
                  Coach chat
                </div>
                <CardTitle className="text-2xl text-slate-950">Plan-aware guidance</CardTitle>
                <CardDescription className="mt-2 text-slate-500">
                  Responses are generated from local mock data while the backend is still optional.
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
                          ? "rounded-tr-md bg-slate-950 text-white"
                          : "rounded-tl-md border border-slate-200/70 bg-white text-slate-700",
                      )}
                    >
                      {message.content}
                    </div>
                    {isUser && (
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white text-slate-700 shadow-sm">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                );
              })}
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
                    className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md"
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
                className="min-h-12 flex-1 rounded-2xl border-transparent bg-transparent px-4 shadow-none focus-visible:ring-indigo-300"
              />
              <Button
                type="submit"
                disabled={!input.trim()}
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
