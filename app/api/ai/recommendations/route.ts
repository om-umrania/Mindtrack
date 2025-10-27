"use server";

import { AI_ON } from "@/src/server/env";
import { withRateLimit, jsonOk, jsonErr } from "@/src/server/http";
import { getRepoCached } from "@/src/server/repo";
import type { IRepository } from "@/src/server/interfaces";
import type { Recommendation } from "@/app/lib/types";
import { getAuthenticatedUser } from "@/src/server/auth";

const DEMO_ENABLED = process.env.NEXT_PUBLIC_DEMO === "true";
const DEMO_EMAIL = "demo@mindtrack.dev";

const FALLBACK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec_demo_focus",
    userId: "demo",
    createdAt: new Date().toISOString(),
    habitName: "Mindful Breathing",
    rationale:
      "A two-minute breathing break helps reset focus between deep work blocks.",
  },
  {
    id: "rec_demo_walk",
    userId: "demo",
    createdAt: new Date().toISOString(),
    habitName: "Evening Walk",
    rationale:
      "A short walk after dinner supports recovery and keeps streaks alive.",
  },
];

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

    if (!AI_ON) {
      return jsonOk({
        ok: true,
        recommendations: FALLBACK_RECOMMENDATIONS.map((rec) => ({
          ...rec,
          userId,
        })),
      });
    }

    const recommendations = await repo.ai.recommendations(userId);
    return jsonOk({ ok: true, recommendations });
  } catch (error) {
    console.error(
      "[ai/recommendations] failed to fetch recommendations",
      error,
    );
    return jsonErr("Unable to fetch AI recommendations", 500);
  }
});
