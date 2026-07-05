// packages/web/src/pages/admin/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { apiClient } from "../../lib/api-client";
import { Users, BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Users",    value: analytics?.totalUsers,        icon: Users     },
          { label: "Total Programs", value: analytics?.totalPrograms,     icon: BarChart3 },
          { label: "Avg Adherence",  value: analytics ? `${analytics.avgAdherenceRate}%` : null, icon: TrendingUp },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-black">{stat.value ?? "—"}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}