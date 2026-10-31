"use server";

import type { ZodError } from "zod";
import { getUserId } from "@/lib/session";
import { createTask, deleteTask, moveTask, updateTask } from "@/lib/tasks";
import { moveInput, taskInput, type Status } from "@/lib/validation";
import type { ActionResult, TaskDTO } from "@/lib/types";

async function requireUserId() {
  const id = await getUserId();
  if (!id) throw new Error("Your session has expired. Sign in again.");
  return id;
}

const invalid = (err: ZodError): ActionResult<never> => ({
  ok: false,
  error: "Fix the highlighted fields and try again.",
  fieldErrors: err.flatten().fieldErrors,
});

const failed = (e: unknown): ActionResult<never> => ({
  ok: false,
  error: e instanceof Error ? e.message : "Something went wrong. Try again.",
});

export async function createTaskAction(input: unknown): Promise<ActionResult<TaskDTO>> {
  try {
    const userId = await requireUserId();
    const parsed = taskInput.safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    return { ok: true, data: await createTask(userId, parsed.data) };
  } catch (e) {
    return failed(e);
  }
}

export async function updateTaskAction(id: string, input: unknown): Promise<ActionResult<TaskDTO>> {
  try {
    const userId = await requireUserId();
    const parsed = taskInput.partial().safeParse(input);
    if (!parsed.success) return invalid(parsed.error);
    const task = await updateTask(userId, id, parsed.data);
    return task ? { ok: true, data: task } : { ok: false, error: "That task no longer exists." };
  } catch (e) {
    return failed(e);
  }
}

export async function deleteTaskAction(id: string): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const done = await deleteTask(userId, id);
    return done ? { ok: true, data: null } : { ok: false, error: "That task no longer exists." };
  } catch (e) {
    return failed(e);
  }
}

export async function moveTaskAction(id: string, status: Status, index: number): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const parsed = moveInput.safeParse({ id, status, index });
    if (!parsed.success) return invalid(parsed.error);
    const done = await moveTask(userId, parsed.data.id, parsed.data.status, parsed.data.index);
    return done ? { ok: true, data: null } : { ok: false, error: "Could not move that task." };
  } catch (e) {
    return failed(e);
  }
}
