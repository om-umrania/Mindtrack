"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import { z } from "zod";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const HabitSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Keep it descriptive (min 2 characters)")
    .max(64, "64 characters max"),
  targetType: z.enum(["boolean", "count", "duration"]),
  targetValue: z
    .number({ invalid_type_error: "Target must be a number" })
    .int("Use whole numbers only")
    .min(0, "Target must be positive"),
});

type TargetType = z.infer<typeof HabitSchema>["targetType"];

type NewHabitDialogProps = {
  trigger?: React.ReactNode;
  onCreated?: () => void;
};

const defaultForm = {
  name: "",
  targetType: "boolean" as TargetType,
  targetValue: "1",
};

export function NewHabitDialog({ trigger, onCreated }: NewHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate } = useSWRConfig();
  const { toast } = useToast();

  const resetForm = () => {
    setForm(defaultForm);
    setErrors({});
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const parsed = HabitSchema.safeParse({
      name: form.name.trim(),
      targetType: form.targetType,
      targetValue: form.targetType === "boolean" ? 1 : Number(form.targetValue),
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const result = await response.json();
      if (!result?.ok) {
        throw new Error("Unexpected response");
      }

      mutate("/habits");
      toast({
        title: "Habit added",
        description: `${parsed.data.name} is now part of your routine.`,
      });
      setOpen(false);
      resetForm();
      onCreated?.();
    } catch (error) {
      console.error("[NewHabitDialog] failed to create habit", error);
      toast({
        title: "Something went wrong",
        description: "We could not save that habit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (value: TargetType) => {
    setForm((prev) => ({
      ...prev,
      targetType: value,
      targetValue: value === "boolean" ? "1" : prev.targetValue,
    }));
    setErrors((prev) => {
      const { targetType, targetValue, ...rest } = prev;
      return rest;
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">New Habit</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a habit</DialogTitle>
          <DialogDescription>
            Track anything from daily checkmarks to timed sessions.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2 text-left">
            <label
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="habit-name"
            >
              Name
            </label>
            <Input
              id="habit-name"
              placeholder="e.g. Morning meditation"
              value={form.name}
              autoComplete="off"
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-2 text-left">
            <label
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="habit-type"
            >
              Target type
            </label>
            <select
              id="habit-type"
              value={form.targetType}
              onChange={(event) =>
                handleTypeChange(event.target.value as TargetType)
              }
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="boolean">Yes / No</option>
              <option value="count">Count</option>
              <option value="duration">Minutes</option>
            </select>
            {errors.targetType && (
              <p className="text-sm text-destructive">{errors.targetType}</p>
            )}
          </div>

          <div className="grid gap-2 text-left">
            <label
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
              htmlFor="habit-target"
            >
              Daily target
            </label>
            <Input
              id="habit-target"
              type="number"
              min={form.targetType === "boolean" ? 1 : 0}
              value={form.targetType === "boolean" ? "1" : form.targetValue}
              disabled={form.targetType === "boolean"}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  targetValue: event.target.value,
                }))
              }
            />
            {errors.targetValue && (
              <p className="text-sm text-destructive">{errors.targetValue}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
