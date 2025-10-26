import { PrismaClient, TargetType, NudgeChannel } from "@prisma/client";
import { subDays, startOfDay } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  await prisma.checkin.deleteMany();
  await prisma.nudge.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      name: "Avery",
      email: "avery@example.com",
    },
  });

  const meditation = await prisma.habit.create({
    data: {
      name: "Morning Meditation",
      targetType: TargetType.DURATION,
      targetValue: 10,
      userId: user.id,
    },
  });

  const walk = await prisma.habit.create({
    data: {
      name: "Daily Walk",
      targetType: TargetType.DURATION,
      targetValue: 30,
      userId: user.id,
    },
  });

  const hydration = await prisma.habit.create({
    data: {
      name: "Hydration",
      targetType: TargetType.COUNT,
      targetValue: 8,
      userId: user.id,
    },
  });

  const createCheckins = async (
    habitId: string,
    values: Array<{ offset: number; value: number }>,
  ) => {
    if (!values.length) return;

    await prisma.checkin.createMany({
      data: values.map(({ offset, value }) => ({
        habitId,
        date: subDays(startOfDay(new Date()), offset),
        value,
      })),
    });
  };

  await createCheckins(meditation.id, [
    { offset: 0, value: 1 },
    { offset: 1, value: 1 },
    { offset: 2, value: 0 },
    { offset: 3, value: 1 },
    { offset: 4, value: 1 },
  ]);

  await createCheckins(
    walk.id,
    Array.from({ length: 7 }).map((_, index) => ({
      offset: index,
      value: 1,
    })),
  );

  await createCheckins(hydration.id, [
    { offset: 0, value: 7 },
    { offset: 1, value: 8 },
    { offset: 2, value: 5 },
    { offset: 3, value: 6 },
    { offset: 4, value: 8 },
  ]);

  await prisma.nudge.create({
    data: {
      userId: user.id,
      channel: NudgeChannel.INAPP,
      message:
        "You’re one check-in away from beating your best streak. Log a task to keep momentum!",
      context: {
        highlightHabit: "Daily Walk",
        streakTarget: 7,
      },
    },
  });

  await prisma.recommendation.createMany({
    data: [
      {
        userId: user.id,
        habitName: "Morning Meditation",
        rationale:
          "Try moving meditation to the same time each day to reinforce the routine.",
      },
      {
        userId: user.id,
        habitName: "Hydration",
        rationale:
          "Set a refill reminder at lunchtime to close the afternoon dip.",
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed error", error);
    await prisma.$disconnect();
    process.exit(1);
  });
