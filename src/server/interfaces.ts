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
  findOrCreateByEmail(email: string, nameHint?: string): Promise<User>;
  getById(id: string): Promise<User | null>;
}

export interface IHabitRepo {
  listByUser(userId: string): Promise<Habit[]>;
  create(userId: string, input: CreateHabitRequest): Promise<Habit>;
}

export interface ICheckinRepo {
  upsertToday(
    items: UpsertCheckinsRequest["items"],
    userId: string,
  ): Promise<void>;
}

export interface IAnalyticsRepo {
  summary(userId: string, window: "7" | "28" | "all"): Promise<Summary>;
}

export interface IAIRepo {
  nudge(userId: string, request: NudgeRequest): Promise<Nudge>;
  recommendations(userId: string): Promise<Recommendation[]>;
}

export type RepoKind = "prisma" | "memory";

export interface IRepository {
  readonly kind: RepoKind;
  readonly user: IUserRepo;
  readonly habit: IHabitRepo;
  readonly checkin: ICheckinRepo;
  readonly analytics: IAnalyticsRepo;
  readonly ai: IAIRepo;
}
