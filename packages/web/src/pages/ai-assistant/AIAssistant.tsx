import { useEffect, useMemo, useState } from "react";
import { Bot, Send, Sparkles, Target, User } from "lucide-react";
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
    <div className="flex h-full min-h-[calc(100vh-7rem)] flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground">
            Ask FitCoach AI for guidance using your selected plan and local logs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm">
            <Target className="h-4 w-4 text-primary" />
            {plan.name}
          </span>
          <span className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            {contextSummary}
          </span>
        </div>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle>Coach chat</CardTitle>
          <CardDescription>
            Mock assistant responses are generated from local plan and daily-log data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
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
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[min(760px,85%)] rounded-lg px-4 py-3 text-sm leading-6",
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                    )}
                  >
                    {message.content}
                  </div>
                  {isUser && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                className="rounded-full border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {question}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about your calories, macros, workouts, or recovery..."
            />
            <Button
              type="button"
              disabled={!input.trim()}
              onClick={() => sendMessage()}
            >
              <Send className="mr-2 h-4 w-4" />
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
