"use server";

import { CheckinsUpsertSchema } from "@/src/server/validation";
import { withRateLimit, jsonOk, jsonErr } from "@/src/server/http";
import { getRepoCached } from "@/src/server/repo";
import type { IRepository } from "@/src/server/interfaces";
import { getAuthenticatedUser } from "@/src/server/auth";

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

export const POST = withRateLimit(async (request: Request) => {
  try {
    const body = await request.json();
    const parsed = CheckinsUpsertSchema.safeParse(body);

    if (!parsed.success) {
      return jsonErr("Invalid check-in payload", 400);
    }

    const repo = await getRepoCached();
    const userId = await resolveUserId(repo);
    if (!userId) {
      return jsonErr("Not authenticated", 401);
    }

    await repo.checkin.upsertToday(parsed.data.items, userId);

    return jsonOk({ ok: true, count: parsed.data.items.length });
  } catch (error) {
    console.error("[checkins] failed to upsert check-ins", error);
    return jsonErr("Unable to update check-ins", 500);
  }
});
