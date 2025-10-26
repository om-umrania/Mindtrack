"use server";

import { AuthLoginSchema } from "@/src/server/validation";
import { withRateLimit, jsonErr, jsonOk } from "@/src/server/http";
import { getRepo } from "@/src/server/repo";

export const POST = withRateLimit(async (request: Request) => {
  try {
    const body = await request.json();
    const parsed = AuthLoginSchema.safeParse(body);

    if (!parsed.success) {
      return jsonErr("Invalid request payload", 422);
    }

    const repo = await getRepo();
    const user = await repo.user.findOrCreateByEmail(parsed.data.email);

    return jsonOk(
      {
        ok: true,
        user,
      },
      200,
    );
  } catch (error) {
    console.error("[auth/login] unexpected error", error);
    return jsonErr("Unable to process login", 500);
  }
});
