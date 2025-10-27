"use server";

import { HabitCreateSchema } from "@/src/server/validation";
import { withRateLimit, jsonOk, jsonErr } from "@/src/server/http";
import { getRepoCached } from "@/src/server/repo";
import type { IRepository } from "@/src/server/interfaces";
import { getAuthenticatedUser } from "@/src/server/auth";

const HabitSchemaRefined = HabitCreateSchema.refine(
  (data) => (data.targetType === "boolean" ? data.targetValue === 1 : true),
  { message: "Boolean habits must have a target of 1", path: ["targetValue"] },
);

let validationWarned = false;
const DEMO_ENABLED = process.env.NEXT_PUBLIC_DEMO === "true";
const DEMO_EMAIL = "demo@mindtrack.dev";

async function resolveUserId(repo: IRepository): Promise<string | null> {
  const authUser = await getAuthenticatedUser();

  if (authUser && authUser.email) {
    const record = await repo.user.findOrCreateByEmail(authUser.email, {
      nameHint: authUser.name,
      clerkId: authUser.userId,
    });
    return record.id;
  }

  if (DEMO_ENABLED) {
    const demo = await repo.user.findOrCreateByEmail(DEMO_EMAIL, {
      nameHint: "Demo User",
    });
    return demo.id;
  }

  return null;
}

export const GET = withRateLimit(async () => {
  try {
    const repo = await getRepoCached();
    const userId = await resolveUserId(repo);
    if (!userId) {
      return jsonErr("Not authenticated", 401);
    }
    const habits = await repo.habit.listByUser(userId);
    return jsonOk({ ok: true, habits });
  } catch (error) {
    console.error("[habits] failed to list habits", error);
    return jsonErr("Unable to fetch habits", 500);
  }
});

export const POST = withRateLimit(async (request: Request) => {
  try {
    const body = await request.json();
    const rawPayload = {
      name: typeof body?.name === "string" ? body.name : undefined,
      targetType:
        typeof body?.targetType === "string"
          ? body.targetType.toLowerCase()
          : undefined,
      targetValue: Number.isFinite(Number(body?.targetValue))
        ? Number(body.targetValue)
        : undefined,
    };

    const parsed = HabitSchemaRefined.safeParse(rawPayload);

    if (!parsed.success) {
      if (!validationWarned) {
        validationWarned = true;
        console.warn(
          "[habits] invalid payload received",
          parsed.error.flatten(),
        );
      }
      return jsonErr("Invalid habit payload", 400);
    }

    const payload = {
      ...parsed.data,
      targetValue:
        parsed.data.targetType === "boolean" ? 1 : parsed.data.targetValue,
    };

    const repo = await getRepoCached();
    const userId = await resolveUserId(repo);
    if (!userId) {
      return jsonErr("Not authenticated", 401);
    }
    const habit = await repo.habit.create(userId, payload);

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
