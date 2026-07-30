import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { apiClient } from "../../lib/api-client";

type Analytics = {
  totalUsers: number;
  totalPrograms: number;
  avgAdherenceRate: number;
};

export function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    apiClient
      .get<{ data: Analytics }>("/admin/analytics")
      .then(({ data }) => setAnalytics(data.data));
  }, []);

  const stats = [
    { label: "Total Users", value: analytics?.totalUsers, icon: Users },
    { label: "Total Programs", value: analytics?.totalPrograms, icon: BarChart3 },
    {
      label: "Avg Adherence",
      value: analytics ? `${analytics.avgAdherenceRate}%` : null,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Platform overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex min-w-0 items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-black">{stat.value ?? "-"}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
