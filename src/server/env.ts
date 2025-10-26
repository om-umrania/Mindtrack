import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_DEMO: z.string().optional(),
  NEXT_PUBLIC_AI_ON: z.string().optional(),
});

const parsed = envSchema.parse(process.env);

export const DATABASE_URL = parsed.DATABASE_URL;
export const IS_DEMO = parsed.NEXT_PUBLIC_DEMO === "true";
export const AI_ON = parsed.NEXT_PUBLIC_AI_ON === "true";
