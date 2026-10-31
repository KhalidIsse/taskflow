import { Types } from "mongoose";
import { connectDB } from "./db";
import Task from "@/models/Task";
import type { TaskDTO } from "./types";
import type { Status, TaskInput } from "./validation";

type Raw = { _id: Types.ObjectId; title: string; description?: string; status: Status; order: number };

const toDTO = (t: Raw): TaskDTO => ({
  id: t._id.toString(),
  title: t.title,
  description: t.description ?? "",
  status: t.status,
  order: t.order,
});

const isId = (id: string) => Types.ObjectId.isValid(id);
const oid = (id: string) => new Types.ObjectId(id);

async function lastOrder(userId: string, status: Status) {
  const last = await Task.findOne({ userId: oid(userId), status })
    .sort({ order: -1 })
    .select("order")
    .lean<{ order: number } | null>();
  return last?.order ?? 0;
}

// All functions take userId and always filter by it: tasks are private to their owner.

export async function listTasks(userId: string): Promise<TaskDTO[]> {
  await connectDB();
  const rows = await Task.find({ userId: oid(userId) }).sort({ order: 1 }).lean<Raw[]>();
  return rows.map(toDTO);
}

export async function getTask(userId: string, id: string): Promise<TaskDTO | null> {
  if (!isId(id)) return null;
  await connectDB();
  const row = await Task.findOne({ _id: oid(id), userId: oid(userId) }).lean<Raw | null>();
  return row ? toDTO(row) : null;
}

export async function createTask(userId: string, input: TaskInput): Promise<TaskDTO> {
  await connectDB();
  const status = input.status ?? "todo";
  const doc = await Task.create({
    title: input.title,
    description: input.description ?? "",
    status,
    userId: oid(userId),
    order: (await lastOrder(userId, status)) + 1000,
  });
  return toDTO(doc.toObject() as unknown as Raw);
}

export async function updateTask(
  userId: string,
  id: string,
  patch: Partial<TaskInput>
): Promise<TaskDTO | null> {
  if (!isId(id)) return null;
  await connectDB();
  const filter = { _id: oid(id), userId: oid(userId) };
  const set: Record<string, unknown> = { ...patch };

  if (patch.status) {
    const current = await Task.findOne(filter).select("status").lean<{ status: Status } | null>();
    if (!current) return null;
    // Changing column puts the task at the bottom of the new one.
    if (current.status !== patch.status) set.order = (await lastOrder(userId, patch.status)) + 1000;
  }

  const row = await Task.findOneAndUpdate(filter, { $set: set }, { new: true }).lean<Raw | null>();
  return row ? toDTO(row) : null;
}

export async function deleteTask(userId: string, id: string): Promise<boolean> {
  if (!isId(id)) return false;
  await connectDB();
  const res = await Task.deleteOne({ _id: oid(id), userId: oid(userId) });
  return res.deletedCount === 1;
}

// Place a task at `index` in column `status` and renumber that column.
export async function moveTask(userId: string, id: string, status: Status, index: number): Promise<boolean> {
  if (!isId(id)) return false;
  await connectDB();
  const owned = await Task.exists({ _id: oid(id), userId: oid(userId) });
  if (!owned) return false;

  const column = await Task.find({ userId: oid(userId), status, _id: { $ne: oid(id) } })
    .sort({ order: 1 })
    .select("_id")
    .lean<{ _id: Types.ObjectId }[]>();
  const ids = column.map((c) => c._id.toString());
  ids.splice(Math.min(index, ids.length), 0, id);

  await Task.bulkWrite(
    ids.map((taskId, i) => ({
      updateOne: {
        filter: { _id: oid(taskId), userId: oid(userId) },
        update: { $set: { order: (i + 1) * 1000, ...(taskId === id ? { status } : {}) } },
      },
    }))
  );
  return true;
}
