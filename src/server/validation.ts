import { z } from "zod";

export const TargetTypeEnum = z.enum(["boolean", "count", "duration"]);

export const HabitCreateSchema = z.object({
  name: z.string().min(2).max(64),
  targetType: TargetTypeEnum,
  targetValue: z.number().int().min(0),
});

export const CheckinsUpsertSchema = z.object({
  items: z
    .array(
      z.object({
        habitId: z.string().min(1),
        value: z.number().int(),
      }),
    )
    .min(1),
});

export const AuthLoginSchema = z.object({
  email: z.string().email(),
});

export const SummaryQuerySchema = z.object({
  window: z.enum(["7", "28", "all"]),
});

export type HabitCreateInput = z.infer<typeof HabitCreateSchema>;
export type CheckinsUpsertInput = z.infer<typeof CheckinsUpsertSchema>;
export type AuthLoginInput = z.infer<typeof AuthLoginSchema>;
export type SummaryQueryInput = z.infer<typeof SummaryQuerySchema>;
