import type {
  User,
  Habit,
  Summary,
  Nudge,
  Recommendation,
  NudgeRequest,
  CreateHabitRequest,
  UpsertCheckinsRequest,
} from "@/app/lib/types";

export interface IUserRepo {
  findOrCreateUserByEmail(email: string, nameHint?: string): Promise<User>;
  getUserById(id: string): Promise<User | null>;
}

export interface IHabitRepo {
  listHabits(userId: string): Promise<Habit[]>;
  createHabit(userId: string, input: CreateHabitRequest): Promise<Habit>;
  upsertCheckins(items: UpsertCheckinsRequest["items"]): Promise<void>;
}

export interface IAnalyticsRepo {
  getSummary(userId: string, window: "7" | "28" | "all"): Promise<Summary>;
}

export interface IAIRepo {
  createNudge(userId: string, request: NudgeRequest): Promise<Nudge>;
  listRecommendations(userId: string): Promise<Recommendation[]>;
}

export type RepoKind = "prisma" | "memory";

export interface IRepository
  extends IUserRepo,
    IHabitRepo,
    IAnalyticsRepo,
    IAIRepo {
  readonly kind: RepoKind;
}
