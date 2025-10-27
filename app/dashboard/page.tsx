"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { api } from "@/app/lib/api";
import { DashboardCards } from "./DashboardCards";
import { CompletionTrend } from "./CompletionTrend";
import { AIPanel } from "./AIPanel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BarChart3, Calendar, AlertTriangle } from "lucide-react";
import { AuthenticatedLayout } from "@/components/authenticated-layout";

function DashboardContent() {
  const [timeWindow, setTimeWindow] = useState<"7" | "28" | "all">("7");
  const {
    data: summary,
    error,
    isLoading,
  } = useSWR(`/analytics/summary?window=${timeWindow}`, () =>
    api.summary(timeWindow),
  );

  const trendData = useMemo(() => {
    if (!summary) return [];
    return summary.heatmap.map((entry) => ({
      date: entry.date,
      pct: entry.value,
    }));
  }, [summary]);

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your habit progress and insights
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Time Window Selector */}
          <div className="flex gap-2">
            {(["7", "28", "all"] as const).map((window) => (
              <Button
                key={window}
                variant={timeWindow === window ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeWindow(window)}
              >
                {window === "7"
                  ? "7 Days"
                  : window === "28"
                    ? "28 Days"
                    : "All Time"}
              </Button>
            ))}
          </div>

          {/* Dashboard Cards */}
          <DashboardCards summary={summary} isLoading={isLoading} />

          {/* Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Completion Trends
              </CardTitle>
              <CardDescription>
                Your habit completion rate over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[240px] w-full" />
              ) : error ? (
                <ErrorState message="Unable to load trends" />
              ) : summary && trendData.length > 0 ? (
                <CompletionTrend data={trendData} />
              ) : (
                <EmptyTrendState />
              )}
            </CardContent>
          </Card>

          {/* Calendar Heatmap Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Activity Heatmap
              </CardTitle>
              <CardDescription>Your daily activity patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Heatmap coming soon</p>
                <p className="text-sm">
                  Track habits to see your activity patterns
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Panel Sidebar */}
        <div className="lg:col-span-1">
          <AIPanel />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthenticatedLayout>
      <DashboardContent />
    </AuthenticatedLayout>
  );
}
function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-[240px] flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 text-destructive">
      <AlertTriangle className="mb-2 h-6 w-6" />
      <p className="text-sm font-medium">{message}</p>
      <p className="text-xs">Please retry or check your connection.</p>
    </div>
  );
}

function EmptyTrendState() {
  return (
    <div className="flex h-[240px] flex-col items-center justify-center text-muted-foreground">
      <BarChart3 className="mb-3 h-8 w-8 opacity-50" />
      <p className="text-sm font-medium">Not enough data yet</p>
      <p className="text-xs">
        Log a few days of habits to unlock completion trends.
      </p>
    </div>
  );
}
