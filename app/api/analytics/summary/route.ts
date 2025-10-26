"use server";

import { SummaryQuerySchema } from "@/src/server/validation";
import { withRateLimit, jsonOk, jsonErr } from "@/src/server/http";
import { getRepoCached } from "@/src/server/repo";
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

export const GET = withRateLimit(async (request: Request) => {
  try {
    const url = new URL(request.url);
    const parsed = SummaryQuerySchema.safeParse({
      window: url.searchParams.get("window") ?? "7",
    });

    if (!parsed.success) {
      return jsonErr("Invalid summary parameters", 422);
    }

    const repo = await getRepoCached();
    const userId = await resolveDemoUserId(repo);
    const summary = await repo.analytics.summary(userId, parsed.data.window);

    return jsonOk({ ok: true, summary });
  } catch (error) {
    console.error("[analytics/summary] failed to compute summary", error);
    return jsonErr("Unable to load analytics summary", 500);
  }
});
