import { PrismaClient, TargetType } from "@prisma/client";
import { startOfDay, subDays } from "date-fns";

const prisma = new PrismaClient();
const DEMO_EMAIL = "demo@mindtrack.app";
const DEMO_USER_ID = "demo";

export async function run() {
  const today = startOfDay(new Date());

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: "Demo User" },
    create: {
      id: DEMO_USER_ID,
      email: DEMO_EMAIL,
      name: "Demo User",
    },
  });

  const habits = await Promise.all([
    prisma.habit.upsert({
      where: { id: "habit_morning_meditation" },
      update: {
        name: "Morning Meditation",
        targetType: TargetType.DURATION,
        targetValue: 10,
        isActive: true,
        userId: user.id,
      },
      create: {
        id: "habit_morning_meditation",
        userId: user.id,
        name: "Morning Meditation",
        targetType: TargetType.DURATION,
        targetValue: 10,
        isActive: true,
      },
    }),
    prisma.habit.upsert({
      where: { id: "habit_daily_walk" },
      update: {
        name: "Daily Walk",
        targetType: TargetType.DURATION,
        targetValue: 30,
        isActive: true,
        userId: user.id,
      },
      create: {
        id: "habit_daily_walk",
        userId: user.id,
        name: "Daily Walk",
        targetType: TargetType.DURATION,
        targetValue: 30,
        isActive: true,
      },
    }),
  ]);

  const habitIds = habits.map((habit) => habit.id);

  await prisma.checkin.deleteMany({
    where: {
      habitId: { in: habitIds },
      date: {
        gte: subDays(today, 14),
      },
    },
  });

  const checkinPlan: Array<{ habitId: string; values: number[] }> = [
    {
      habitId: "habit_morning_meditation",
      values: [1, 1, 0, 1, 1, 0, 1],
    },
    {
      habitId: "habit_daily_walk",
      values: [1, 1, 1, 0, 1, 1, 1],
    },
  ];

  for (const plan of checkinPlan) {
    const data = plan.values.map((value, index) => ({
      habitId: plan.habitId,
      date: subDays(today, index),
      value,
    }));

    if (data.length > 0) {
      await prisma.checkin.createMany({ data });
    }
  }

  console.log("Seeded demo data for user:", user.email);
}

const isDirectRun =
  process.argv[1] &&
  new URL(`file://${process.argv[1]}`).href === import.meta.url;

if (isDirectRun) {
  run()
    .catch((error) => {
      console.error("Seed error", error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
