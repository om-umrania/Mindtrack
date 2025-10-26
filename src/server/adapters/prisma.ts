import {
  Prisma,
  PrismaClient,
  NudgeChannel,
  TargetType as PrismaTargetType,
} from "@prisma/client";
import { startOfDay } from "date-fns";
import type {
  User as PrismaUser,
  Habit as PrismaHabit,
  Checkin as PrismaCheckin,
  Nudge as PrismaNudge,
  Recommendation as PrismaRecommendation,
} from "@prisma/client";
import type {
  User,
  Habit,
  Nudge,
  Recommendation,
  Summary,
  CreateHabitRequest,
  UpsertCheckinsRequest,
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

let prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

const mapUser = (user: PrismaUser): User => ({
  id: user.id,
  email: user.email,
  name: user.name,
});

const mapHabit = (habit: PrismaHabit): Habit => ({
  id: habit.id,
  userId: habit.userId,
  name: habit.name,
  targetType: habit.targetType.toLowerCase() as Habit["targetType"],
  targetValue: habit.targetValue,
  isActive: habit.isActive,
});

const mapNudge = (nudge: PrismaNudge): Nudge => ({
  id: nudge.id,
  userId: nudge.userId,
  createdAt: nudge.createdAt.toISOString(),
  channel: nudge.channel.toLowerCase() as Nudge["channel"],
  message: nudge.message,
  context: (nudge.context as Record<string, unknown>) ?? {},
});

const mapRecommendation = (
  recommendation: PrismaRecommendation,
): Recommendation => ({
  id: recommendation.id,
  userId: recommendation.userId,
  createdAt: recommendation.createdAt.toISOString(),
  habitName: recommendation.habitName,
  rationale: recommendation.rationale,
});

const repoWarned = {
  user: false,
} as const;

class PrismaRepo implements IRepository {
  readonly kind = "prisma" as const;
  private client = getPrisma();

  readonly user: IUserRepo = {
    findOrCreateByEmail: async (email: string, nameHint?: string) => {
      const existing = await this.client.user.findUnique({ where: { email } });
      if (existing) {
        return mapUser(existing);
      }
      const created = await this.client.user.create({
        data: {
          email,
          name: nameHint ?? email.split("@")[0],
        },
      });
      return mapUser(created);
    },
    getById: async (id: string) => {
      const user = await this.client.user.findUnique({ where: { id } });
      return user ? mapUser(user) : null;
    },
  };

  readonly habit: IHabitRepo = {
    listByUser: async (userId: string) => {
      const habits = await this.client.habit.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });
      return habits.map(mapHabit);
    },
    create: async (userId: string, input: CreateHabitRequest) => {
      const created = await this.client.habit.create({
        data: {
          userId,
          name: input.name,
          targetType: input.targetType.toUpperCase() as PrismaTargetType,
          targetValue: input.targetValue,
        },
      });
      return mapHabit(created);
    },
  };

  readonly checkin: ICheckinRepo = {
    upsertToday: async (
      items: UpsertCheckinsRequest["items"],
      _userId: string,
    ) => {
      const today = startOfDay(new Date());
      await Promise.all(
        items.map((item) =>
          this.client.checkin.upsert({
            where: {
              habitId_date: {
                habitId: item.habitId,
                date: today,
              },
            },
            update: {
              value: item.value,
            },
            create: {
              habitId: item.habitId,
              date: today,
              value: item.value,
            },
          }),
        ),
      );
    },
  };

  readonly analytics: IAnalyticsRepo = {
    summary: async (userId: string, window: "7" | "28" | "all") => {
      const habits = await this.client.habit.findMany({
        where: { userId },
        include: { checkins: true },
      });
      return buildSummary(
        habits.map((habit) => ({
          id: habit.id,
          checkins: habit.checkins.map((checkin: PrismaCheckin) => ({
            date: checkin.date,
            value: checkin.value,
          })),
        })),
        window,
      );
    },
  };

  readonly ai: IAIRepo = {
    nudge: async (userId: string, request: NudgeRequest) => {
      const message =
        typeof request.context?.message === "string"
          ? request.context.message
          : "Keep pushing toward your goals!";

      const created = await this.client.nudge.create({
        data: {
          userId,
          channel: NudgeChannel.INAPP,
          message,
          context: (request.context ?? {}) as Prisma.InputJsonValue,
        },
      });
      return mapNudge(created);
    },
    recommendations: async (userId: string) => {
      const recommendations = await this.client.recommendation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return recommendations.map(mapRecommendation);
    },
  };
}

export { PrismaRepo };
