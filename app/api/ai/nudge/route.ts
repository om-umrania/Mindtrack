"use server";

import { AI_ON } from "@/src/server/env";
import { withRateLimit, jsonOk, jsonErr } from "@/src/server/http";
import { getRepo } from "@/src/server/repo";
import type { IRepository } from "@/src/server/interfaces";
import type { NudgeRequest, Nudge } from "@/app/lib/types";

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

const FALLBACK_NUDGE: Nudge = {
  id: "nudge_demo",
  userId: DEMO_USER_ID,
  createdAt: new Date().toISOString(),
  channel: "inapp",
  message: "Log a quick win to keep your streak alive!",
  context: { recommendation: "Stay consistent with your top habit today." },
};

export const POST = withRateLimit(async (request: Request) => {
  try {
    const repo = await getRepo();
    const userId = await resolveDemoUserId(repo);

    if (!AI_ON) {
      return jsonOk({ ok: true, nudge: { ...FALLBACK_NUDGE, userId } });
    }

    const payload = (await request.json().catch(() => ({}))) as NudgeRequest;
    const nudge = await repo.ai.nudge(userId, payload);

    return jsonOk({ ok: true, nudge });
  } catch (error) {
    console.error("[ai/nudge] failed to generate nudge", error);
    return jsonErr("Unable to generate AI nudge", 500);
  }
});
