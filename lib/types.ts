import type { Status } from "./validation";

export type TaskDTO = {
  id: string;
  title: string;
  description: string;
  status: Status;
  order: number;
};

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };
