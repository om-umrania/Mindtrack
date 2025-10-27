import { randomUUID } from "crypto";
import { startOfDay, subDays } from "date-fns";
import type {
  User,
  Habit,
  CreateHabitRequest,
  UpsertCheckinsRequest,
  Nudge,
  Recommendation,
  Summary,
  NudgeRequest,
} from "@/app/lib/types";
import type {
  IRepository,
  IUserRepo,
  IHabitRepo,
  ICheckinRepo,
  IAnalyticsRepo,
  IAIRepo,
} from "../interfaces";
import { buildSummary } from "../utils/summary";

type MemoryCheckin = {
  habitId: string;
  date: Date;
  value: number;
};

const demoUser: User = {
  id: "user_demo",
  name: "Demo User",
  email: "demo@mindtrack.dev",
};

const demoHabits: Habit[] = [
  {
    id: "habit_demo_1",
    userId: demoUser.id,
    name: "Morning Meditation",
    targetType: "duration",
    targetValue: 10,
    isActive: true,
  },
  {
    id: "habit_demo_2",
    userId: demoUser.id,
    name: "Daily Walk",
    targetType: "duration",
    targetValue: 30,
    isActive: true,
  },
];

const initialCheckins: MemoryCheckin[] = [
  {
    habitId: "habit_demo_1",
    date: startOfDay(new Date()),
    value: 1,
  },
  {
    habitId: "habit_demo_1",
    date: subDays(startOfDay(new Date()), 1),
    value: 1,
  },
  {
    habitId: "habit_demo_2",
    date: startOfDay(new Date()),
    value: 1,
  },
  {
    habitId: "habit_demo_2",
    date: subDays(startOfDay(new Date()), 1),
    value: 1,
  },
];

const initialRecommendations: Recommendation[] = [
  {
    id: "rec_demo_1",
    userId: demoUser.id,
    createdAt: new Date().toISOString(),
    habitName: "Morning Meditation",
    rationale: "Consistency builds momentum. Keep a morning reminder handy.",
  },
  {
    id: "rec_demo_2",
    userId: demoUser.id,
    createdAt: new Date().toISOString(),
    habitName: "Daily Walk",
    rationale:
      "Schedule a short walk after lunch to break up afternoon slumps.",
  },
];

class MemoryRepo implements IRepository {
  readonly kind = "memory" as const;
  private users: User[] = [demoUser];
  private habits: Habit[] = [...demoHabits];
  private checkins: MemoryCheckin[] = [...initialCheckins];
  private nudges: Nudge[] = [];
  private recommendations: Recommendation[] = [...initialRecommendations];

  readonly user: IUserRepo = {
    findOrCreateByEmail: async (email: string, options) => {
      const nameHint = options?.nameHint;
      const clerkId = options?.clerkId;

      if (clerkId) {
        const byClerk = this.users.find((user) => user.clerkId === clerkId);
        if (byClerk) {
          return byClerk;
        }
      }

      const existing = this.users.find((user) => user.email === email);
      if (existing) {
        if (clerkId && existing.clerkId !== clerkId) {
          existing.clerkId = clerkId;
        }
        if (nameHint && !existing.name) {
          existing.name = nameHint;
        }
        return existing;
      }
      const created: User = {
        id: randomUUID(),
        email,
        name: nameHint ?? email.split("@")[0],
        clerkId,
      };
      this.users.push(created);
      return created;
    },
    getById: async (id: string) =>
      this.users.find((user) => user.id === id) ?? null,
    getByClerkId: async (clerkId: string) =>
      this.users.find((user) => user.clerkId === clerkId) ?? null,
  };

  readonly habit: IHabitRepo = {
    listByUser: async (userId: string) =>
      this.habits.filter((habit) => habit.userId === userId),
    create: async (userId: string, input: CreateHabitRequest) => {
      const habit: Habit = {
        id: randomUUID(),
        userId,
        name: input.name,
        targetType: input.targetType,
        targetValue: input.targetValue,
        isActive: true,
      };
      this.habits.push(habit);
      return habit;
    },
  };

  readonly checkin: ICheckinRepo = {
    upsertToday: async (
      items: UpsertCheckinsRequest["items"],
      _userId: string,
    ) => {
      const today = startOfDay(new Date());
      for (const item of items) {
        const existing = this.checkins.find(
          (checkin) =>
            checkin.habitId === item.habitId &&
            checkin.date.getTime() === today.getTime(),
        );
        if (existing) {
          existing.value = item.value;
        } else {
          this.checkins.push({
            habitId: item.habitId,
            date: today,
            value: item.value,
          });
        }
      }
    },
  };

  readonly analytics: IAnalyticsRepo = {
    summary: async (userId: string, window: "7" | "28" | "all") => {
      const habits = this.habits.filter((habit) => habit.userId === userId);
      const checkinsByHabit = habits.map((habit) => ({
        id: habit.id,
        checkins: this.checkins
          .filter((checkin) => checkin.habitId === habit.id)
          .map((checkin) => ({
            date: checkin.date,
            value: checkin.value,
          })),
      }));
      return buildSummary(checkinsByHabit, window);
    },
  };

  readonly ai: IAIRepo = {
    nudge: async (userId: string, request: NudgeRequest) => {
      const nudge: Nudge = {
        id: randomUUID(),
        userId,
        createdAt: new Date().toISOString(),
        channel: "inapp",
        message:
          typeof request.context?.message === "string"
            ? request.context.message
            : "Stay on track—log a habit update today!",
        context: request.context ?? {},
      };
      this.nudges.push(nudge);
      return nudge;
    },
    recommendations: async (userId: string) =>
      this.recommendations.filter(
        (recommendation) => recommendation.userId === userId,
      ),
  };
}

export { MemoryRepo };
