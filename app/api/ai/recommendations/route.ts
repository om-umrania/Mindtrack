"use server";

import { AI_ON } from "@/src/server/env";
import { withRateLimit, jsonOk, jsonErr } from "@/src/server/http";
import { getRepoCached } from "@/src/server/repo";
import type { IRepository } from "@/src/server/interfaces";
import type { Recommendation } from "@/app/lib/types";

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

const FALLBACK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec_demo_focus",
    userId: DEMO_USER_ID,
    createdAt: new Date().toISOString(),
    habitName: "Mindful Breathing",
    rationale:
      "A two-minute breathing break helps reset focus between deep work blocks.",
  },
  {
    id: "rec_demo_walk",
    userId: DEMO_USER_ID,
    createdAt: new Date().toISOString(),
    habitName: "Evening Walk",
    rationale:
      "A short walk after dinner supports recovery and keeps streaks alive.",
  },
];

export const GET = withRateLimit(async (request: Request) => {
  try {
    const repo = await getRepoCached();
    const userId = await resolveDemoUserId(repo);

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
