import { z } from "zod";

export const STATUSES = ["todo", "in_progress", "done"] as const;
export type Status = (typeof STATUSES)[number];

export const taskInput = z.object({
  title: z.string().trim().min(1, "Enter a title").max(120, "Keep the title under 120 characters"),
  description: z.string().trim().max(1000, "Keep the description under 1000 characters").optional(),
  status: z.enum(STATUSES).optional(),
});
export type TaskInput = z.infer<typeof taskInput>;

export const moveInput = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid task id"),
  status: z.enum(STATUSES),
  index: z.number().int().min(0),
});
