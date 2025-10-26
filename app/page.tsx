"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-black">
        <div className="text-center">
          <p className="text-sm font-medium text-indigo-500 dark:text-indigo-300">
            Checking your session…
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">
            Loading Mindtrack
          </h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Hang tight while we sync your workspace.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 rounded-3xl bg-white/80 p-10 text-center shadow-xl backdrop-blur dark:bg-slate-900/80">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
            Mindtrack
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-4xl">
            Build momentum with mindful habits
          </h1>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
            Jump back into your dashboard or explore a guided walkthrough to see
            how AI nudges, analytics, and streak tracking keep you on course.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="min-w-[160px]">
            <Link href={user ? "/dashboard" : "/login"}>
              {user ? "Go to Dashboard" : "Sign in to Mindtrack"}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-[160px]">
            <Link href="/dashboard?tour=1">Start Interactive Tour</Link>
          </Button>
        </div>

        <div className="grid w-full gap-4 text-left sm:grid-cols-3">
          <FeatureCard
            title="AI Nudges"
            description="Get personalized prompts when streaks slip."
          />
          <FeatureCard
            title="Habit Scorecards"
            description="See completion trends, streaks, and heatmaps."
          />
          <FeatureCard
            title="One-click Logging"
            description="Update today’s habits from any device."
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/70">
      <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        {title}
      </h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}
