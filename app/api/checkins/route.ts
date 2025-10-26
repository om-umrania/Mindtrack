"use server";

import { CheckinsUpsertSchema } from "@/src/server/validation";
import { withRateLimit, jsonOk, jsonErr } from "@/src/server/http";
import { getRepo } from "@/src/server/repo";
import type { IRepository } from "@/src/server/interfaces";

const DEMO_USER_ID = "demo";

async function resolveDemoUserId(repo: IRepository): Promise<string> {
  const existing = await repo.user.getById(DEMO_USER_ID);
  if (existing) {
    return existing.id;
  }
  const fallback = await repo.user.findOrCreateByEmail(
    "demo@mindtrack.dev",
    "Demo",
  );
  return fallback.id;
}

export const POST = withRateLimit(async (request: Request) => {
  try {
    const body = await request.json();
    const parsed = CheckinsUpsertSchema.safeParse(body);

    if (!parsed.success) {
      return jsonErr("Invalid check-in payload", 422);
    }

    const repo = await getRepo();
    const userId = await resolveDemoUserId(repo);
    await repo.checkin.upsertToday(parsed.data.items, userId);

    return jsonOk({ ok: true, count: parsed.data.items.length });
  } catch (error) {
    console.error("[checkins] failed to upsert check-ins", error);
    return jsonErr("Unable to update check-ins", 500);
  }
});
