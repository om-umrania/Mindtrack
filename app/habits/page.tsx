"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import HabitToggleList from "./HabitToggleList";
import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { NewHabitDialog } from "@/components/habits/NewHabitDialog";
import useSWR from "swr";
import { api } from "@/app/lib/api";
import { useSWRConfig } from "swr";

function HabitsContent() {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { data: habits } = useSWR("/habits", api.getHabits);

  const handleHabitCreated = () => {
    mutate("/habits");
    toast({
      title: "Habit created!",
      description: "Keep the momentum going.",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Habits</h1>
          <p className="text-muted-foreground">
            Track your daily habits and build consistency
          </p>
        </div>

        <NewHabitDialog
          onCreated={handleHabitCreated}
          trigger={<Button>New Habit</Button>}
        />
      </div>

      {habits && habits.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="space-y-3 text-muted-foreground">
            <p className="text-lg font-medium text-slate-800 dark:text-slate-100">
              No habits yet
            </p>
            <p className="text-sm">
              Start by creating a habit you want to build. Need ideas? Try a
              10-minute morning stretch or a hydration challenge.
            </p>
            <NewHabitDialog
              onCreated={handleHabitCreated}
              trigger={<Button size="sm">Create your first habit</Button>}
            />
          </div>
        </Card>
      ) : (
        <HabitToggleList onSave={() => mutate("/habits")} />
      )}
    </div>
  );
}

export default function HabitsPage() {
  return (
    <AuthenticatedLayout>
      <HabitsContent />
    </AuthenticatedLayout>
  );
}
