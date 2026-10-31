import { NextResponse } from "next/server";
import { getUserId } from "@/lib/session";
import { deleteTask, getTask, updateTask } from "@/lib/tasks";
import { taskInput } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const notFound = () => NextResponse.json({ error: "Task not found" }, { status: 404 });

export async function GET(_req: Request, { params }: Ctx) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const task = await getTask(userId, (await params).id);
  return task ? NextResponse.json({ task }) : notFound();
}

export async function PUT(req: Request, { params }: Ctx) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const parsed = taskInput.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const task = await updateTask(userId, (await params).id, parsed.data);
  return task ? NextResponse.json({ task }) : notFound();
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  const ok = await deleteTask(userId, (await params).id);
  return ok ? NextResponse.json({ ok: true }) : notFound();
}
