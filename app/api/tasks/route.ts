import { NextResponse } from "next/server";
import { getUserId } from "@/lib/session";
import { createTask, listTasks } from "@/lib/tasks";
import { taskInput } from "@/lib/validation";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ tasks: await listTasks(userId) });
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = taskInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  return NextResponse.json({ task: await createTask(userId, parsed.data) }, { status: 201 });
}
