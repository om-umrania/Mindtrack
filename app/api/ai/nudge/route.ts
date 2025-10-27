"use server";

import { AI_ON } from "@/src/server/env";
import { withRateLimit, jsonOk, jsonErr } from "@/src/server/http";
import { getRepoCached } from "@/src/server/repo";
import type { IRepository } from "@/src/server/interfaces";
import type { NudgeRequest, Nudge } from "@/app/lib/types";
import { getAuthenticatedUser } from "@/src/server/auth";

const DEMO_ENABLED = process.env.NEXT_PUBLIC_DEMO === "true";
const DEMO_EMAIL = "demo@mindtrack.dev";

const FALLBACK_NUDGE: Nudge = {
  id: "nudge_demo",
  userId: "demo",
  createdAt: new Date().toISOString(),
  channel: "inapp",
  message: "Log a quick win to keep your streak alive!",
  context: { recommendation: "Stay consistent with your top habit today." },
};

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
    const repo = await getRepoCached();
    const userId = await resolveUserId(repo);
    if (!userId) {
      return jsonErr("Not authenticated", 401);
    }

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
