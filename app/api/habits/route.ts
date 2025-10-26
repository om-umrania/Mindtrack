"use server";

import { HabitCreateSchema } from "@/src/server/validation";
import { withRateLimit, jsonOk, jsonErr } from "@/src/server/http";
import { getRepo } from "@/src/server/repo";
import type { IRepository } from "@/src/server/interfaces";

const DEMO_USER_ID = "demo";

async function resolveDemoUserId(repo: IRepository): Promise<string> {
  const existing = await repo.getUserById(DEMO_USER_ID);
  if (existing) {
    return existing.id;
  }

  const fallback = await repo.findOrCreateUserByEmail(
    "demo@mindtrack.dev",
    "Demo",
  );
  return fallback.id;
}

export const GET = withRateLimit(async (request: Request) => {
  try {
    const repo = await getRepo();
    const userId = await resolveDemoUserId(repo);
    const habits = await repo.listHabits(userId);
    return jsonOk({ ok: true, habits });
  } catch (error) {
    console.error("[habits] failed to list habits", error);
    return jsonErr("Unable to fetch habits", 500);
  }
});

export const POST = withRateLimit(async (request: Request) => {
  try {
    const body = await request.json();
    const parsed = HabitCreateSchema.safeParse(body);

    if (!parsed.success) {
      return jsonErr("Invalid habit payload", 422);
    }

    const repo = await getRepo();
    const userId = await resolveDemoUserId(repo);
    const habit = await repo.createHabit(userId, parsed.data);

    return jsonOk(
      {
        ok: true,
        habit,
      },
      201,
    );
  } catch (error) {
    console.error("[habits] failed to create habit", error);
    return jsonErr("Unable to create habit", 500);
  }
});
