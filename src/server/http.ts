type JsonValue = Record<string, unknown> | unknown[];

export function jsonOk(data: JsonValue, status = 200) {
  return Response.json(data, { status });
}

export function jsonErr(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

type RateEntry = {
  count: number;
  expiresAt: number;
};

const RATE_LIMIT_CACHE = new Map<string, RateEntry>();

type Handler = (request: Request) => Promise<Response>;

function getKey(ip: string | null, route: string) {
  return `${ip ?? "unknown"}:${route}`;
}

export function withRateLimit(
  handler: Handler,
  options?: { maxPerMinute?: number },
): Handler {
  const limit = options?.maxPerMinute ?? 60;
  const windowMs = 60_000;

  return async (request: Request) => {
    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("cf-connecting-ip") ??
      null;
    const key = getKey(ip, new URL(request.url).pathname);
    const now = Date.now();
    const entry = RATE_LIMIT_CACHE.get(key);

    if (!entry || entry.expiresAt < now) {
      RATE_LIMIT_CACHE.set(key, { count: 1, expiresAt: now + windowMs });
    } else {
      if (entry.count >= limit) {
        return jsonErr("Too many requests", 429);
      }
      entry.count += 1;
    }

    return handler(request);
  };
}
