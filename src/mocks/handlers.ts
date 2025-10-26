import { rest } from "msw";
import type {
  Habit,
  Summary,
  Nudge,
  Recommendation,
  User,
} from "@/app/lib/types";

const mockUser: User = {
  id: "user_1",
  name: "Avery",
  email: "avery@example.com",
};

const mockHabits: Habit[] = [
  {
    id: "habit_1",
    userId: mockUser.id,
    name: "Morning Meditation",
    targetType: "duration",
    targetValue: 10,
    isActive: true,
  },
  {
    id: "habit_2",
    userId: mockUser.id,
    name: "Daily Walk",
    targetType: "duration",
    targetValue: 30,
    isActive: true,
  },
  {
    id: "habit_3",
    userId: mockUser.id,
    name: "Hydration",
    targetType: "count",
    targetValue: 8,
    isActive: true,
  },
];

const summaryByWindow: Record<"7" | "28" | "all", Summary> = {
  "7": {
    window: "7",
    completionPct: 68,
    currentStreaks: [
      { habitId: "habit_1", days: 4 },
      { habitId: "habit_2", days: 6 },
    ],
    heatmap: Array.from({ length: 7 }).map((_, index) => ({
      date: new Date(Date.now() - index * 86400000).toISOString().slice(0, 10),
      value: Math.floor(Math.random() * 3),
    })),
    leaderboard: [
      { habitId: "habit_2", adherence: 92 },
      { habitId: "habit_1", adherence: 75 },
      { habitId: "habit_3", adherence: 60 },
    ],
  },
  "28": {
    window: "28",
    completionPct: 61,
    currentStreaks: [
      { habitId: "habit_2", days: 12 },
      { habitId: "habit_3", days: 8 },
    ],
    heatmap: Array.from({ length: 28 }).map((_, index) => ({
      date: new Date(Date.now() - index * 86400000).toISOString().slice(0, 10),
      value: Math.floor(Math.random() * 3),
    })),
    leaderboard: [
      { habitId: "habit_2", adherence: 88 },
      { habitId: "habit_1", adherence: 64 },
      { habitId: "habit_3", adherence: 58 },
    ],
  },
  all: {
    window: "all",
    completionPct: 59,
    currentStreaks: [
      { habitId: "habit_1", days: 18 },
      { habitId: "habit_2", days: 24 },
    ],
    heatmap: Array.from({ length: 30 }).map((_, index) => ({
      date: new Date(Date.now() - index * 86400000).toISOString().slice(0, 10),
      value: Math.floor(Math.random() * 3),
    })),
    leaderboard: [
      { habitId: "habit_2", adherence: 90 },
      { habitId: "habit_1", adherence: 70 },
      { habitId: "habit_3", adherence: 55 },
    ],
  },
};

const mockRecommendations: Recommendation[] = [
  {
    id: "rec_1",
    userId: mockUser.id,
    createdAt: new Date().toISOString(),
    habitName: "Morning Meditation",
    rationale:
      "Morning sessions build consistency and set a calm tone for the day.",
  },
  {
    id: "rec_2",
    userId: mockUser.id,
    createdAt: new Date().toISOString(),
    habitName: "Daily Walk",
    rationale:
      "Aim for a short afternoon walk to break up sedentary stretches.",
  },
];

export const handlers = [
  rest.post("/api/auth/login", async (req, res, ctx) => {
    const { email } = await req.json<{ email?: string }>();
    return res(
      ctx.delay(400),
      ctx.status(200),
      ctx.json({
        ...mockUser,
        email: email ?? mockUser.email,
        name: email ? email.split("@")[0] : mockUser.name,
      }),
    );
  }),

  rest.get("/api/habits", (_req, res, ctx) => {
    return res(ctx.delay(300), ctx.status(200), ctx.json(mockHabits));
  }),

  rest.post("/api/habits", async (req, res, ctx) => {
    const body = await req.json<Partial<Habit>>();
    const created: Habit = {
      id: `habit_${mockHabits.length + 1}`,
      userId: mockUser.id,
      name: body.name ?? "New Habit",
      targetType: body.targetType ?? "boolean",
      targetValue: body.targetValue ?? 1,
      isActive: true,
    };
    mockHabits.push(created);
    return res(ctx.status(201), ctx.json(created));
  }),

  rest.post("/api/checkins", async (_req, res, ctx) => {
    return res(ctx.status(204));
  }),

  rest.get("/api/analytics/summary", (req, res, ctx) => {
    const windowParam = (req.url.searchParams.get("window") ?? "7") as
      | "7"
      | "28"
      | "all";
    const summary = summaryByWindow[windowParam] ?? summaryByWindow["all"];
    return res(ctx.delay(250), ctx.status(200), ctx.json(summary));
  }),

  rest.post("/api/ai/nudge", async (_req, res, ctx) => {
    const nudge: Nudge = {
      id: "nudge_1",
      userId: mockUser.id,
      createdAt: new Date().toISOString(),
      channel: "inapp",
      message:
        "Your streak is almost at a new high—log today’s progress to keep it going!",
      context: {
        highlightHabit: "Daily Walk",
      },
    };
    return res(ctx.status(200), ctx.json(nudge));
  }),

  rest.get("/api/ai/recommendations", (_req, res, ctx) => {
    return res(ctx.delay(200), ctx.status(200), ctx.json(mockRecommendations));
  }),
];
