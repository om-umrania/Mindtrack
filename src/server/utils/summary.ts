import { startOfDay, subDays } from "date-fns";
import type { Summary } from "@/app/lib/types";

type HabitCheckins = {
  id: string;
  checkins: Array<{ date: Date; value: number }>;
};

const WINDOW_DAYS: Record<"7" | "28" | "all", number> = {
  "7": 7,
  "28": 28,
  all: 30,
};

const dayKey = (date: Date) => startOfDay(date).getTime();

export function buildSummary(
  habits: HabitCheckins[],
  window: "7" | "28" | "all",
): Summary {
  const today = startOfDay(new Date());
  const rangeDays = WINDOW_DAYS[window];
  const startDate =
    window === "all" ? undefined : startOfDay(subDays(today, rangeDays - 1));
  const startTime = startDate?.getTime();

  const normalized = habits.map((habit) => ({
    id: habit.id,
    checkins: habit.checkins.map((checkin) => ({
      date: startOfDay(checkin.date),
      value: checkin.value,
    })),
  }));

  const completionNumerator = normalized.reduce((acc, habit) => {
    const relevant = habit.checkins.filter((checkin) => {
      if (startTime === undefined) return true;
      return dayKey(checkin.date) >= startTime;
    });
    return (
      acc +
      relevant.reduce((count, item) => count + (item.value > 0 ? 1 : 0), 0)
    );
  }, 0);

  const expectedSlots =
    window === "all"
      ? normalized.reduce((acc, habit) => acc + habit.checkins.length, 0) || 1
      : (normalized.length || 1) * rangeDays;

  const completionPct = Math.min(
    100,
    Math.round((completionNumerator / expectedSlots) * 100) || 0,
  );

  const currentStreaks = normalized.map((habit) => {
    const positiveDays = new Set(
      habit.checkins
        .filter((checkin) => checkin.value > 0)
        .map((checkin) => dayKey(checkin.date)),
    );
    let streak = 0;
    for (let dayOffset = 0; ; dayOffset++) {
      const dateKey = dayKey(subDays(today, dayOffset));
      if (positiveDays.has(dateKey)) {
        streak += 1;
      } else {
        break;
      }
    }
    return {
      habitId: habit.id,
      days: streak,
    };
  });

  const heatmap = Array.from({ length: rangeDays }).map((_, index) => {
    const date = subDays(today, rangeDays - index - 1);
    const dateKeyValue = dayKey(date);
    const value = normalized.reduce((sum, habit) => {
      const matching = habit.checkins.find(
        (checkin) => dayKey(checkin.date) === dateKeyValue,
      );
      return sum + (matching?.value ?? 0);
    }, 0);
    return {
      date: date.toISOString().slice(0, 10),
      value,
    };
  });

  const leaderboard = normalized
    .map((habit) => {
      const relevant = habit.checkins.filter((checkin) => {
        if (startTime === undefined) return true;
        return dayKey(checkin.date) >= startTime;
      });
      if (relevant.length === 0) {
        return { habitId: habit.id, adherence: 0 };
      }
      const positive = relevant.filter((checkin) => checkin.value > 0).length;
      return {
        habitId: habit.id,
        adherence: Math.min(
          100,
          Math.round((positive / relevant.length) * 100),
        ),
      };
    })
    .sort((a, b) => b.adherence - a.adherence);

  return {
    window,
    completionPct,
    currentStreaks,
    heatmap,
    leaderboard,
  };
}
