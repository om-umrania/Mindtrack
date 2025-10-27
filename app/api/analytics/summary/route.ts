"use server";

import { SummaryQuerySchema } from "@/src/server/validation";
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

export const GET = withRateLimit(async (request: Request) => {
  try {
    const url = new URL(request.url);
    const parsed = SummaryQuerySchema.safeParse({
      window: url.searchParams.get("window") ?? "7",
    });

    if (!parsed.success) {
      return jsonErr("Invalid summary parameters", 400);
    }

    const repo = await getRepoCached();
    const userId = await resolveUserId(repo);
    if (!userId) {
      return jsonErr("Not authenticated", 401);
    }

    const summary = await repo.analytics.summary(userId, parsed.data.window);

    return jsonOk({ ok: true, summary });
  } catch (error) {
    console.error("[analytics/summary] failed to compute summary", error);
    return jsonErr("Unable to load analytics summary", 500);
  }
});
