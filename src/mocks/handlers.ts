import { http, HttpResponse, delay } from "msw";
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
  http.post("/api/auth/login", async ({ request }) => {
    const { email } = (await request.json()) as { email?: string };
    await delay(400);
    return HttpResponse.json(
      {
        ...mockUser,
        email: email ?? mockUser.email,
        name: email ? email.split("@")[0] : mockUser.name,
      },
      { status: 200 },
    );
  }),

  http.get("/api/habits", async () => {
    await delay(300);
    return HttpResponse.json(mockHabits, { status: 200 });
  }),

  http.post("/api/habits", async ({ request }) => {
    const body = (await request.json()) as Partial<Habit> | null;
    const created: Habit = {
      id: `habit_${mockHabits.length + 1}`,
      userId: mockUser.id,
      name: body?.name ?? "New Habit",
      targetType: body?.targetType ?? "boolean",
      targetValue: body?.targetValue ?? 1,
      isActive: true,
    };
    mockHabits.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post("/api/checkins", async () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/analytics/summary", async ({ request }) => {
    const url = new URL(request.url);
    const windowParam = (url.searchParams.get("window") ?? "7") as
      | "7"
      | "28"
      | "all";
    const summary = summaryByWindow[windowParam] ?? summaryByWindow["all"];
    await delay(250);
    return HttpResponse.json(summary, { status: 200 });
  }),

  http.post("/api/ai/nudge", async () => {
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
    return HttpResponse.json(nudge, { status: 200 });
  }),

  http.get("/api/ai/recommendations", async () => {
    await delay(200);
    return HttpResponse.json(mockRecommendations, { status: 200 });
  }),
];
