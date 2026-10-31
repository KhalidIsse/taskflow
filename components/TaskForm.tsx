"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { createTaskAction, updateTaskAction } from "@/app/actions";
import { taskInput, type Status } from "@/lib/validation";
import type { TaskDTO } from "@/lib/types";

type Props = {
  task?: TaskDTO;
  defaultStatus: Status;
  onClose: () => void;
  onSaved: (task: TaskDTO) => void;
};

type FieldErrors = Record<string, string[] | undefined>;

export default function TaskForm({ task, defaultStatus, onClose, onSaved }: Props) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [pending, start] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => titleRef.current?.focus(), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = taskInput.safeParse({
      title: String(fd.get("title") ?? ""),
      description: String(fd.get("description") ?? ""),
      status: String(fd.get("status") ?? defaultStatus),
    });
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    setErrors({});
    setFormError("");
    start(async () => {
      const res = task ? await updateTaskAction(task.id, parsed.data) : await createTaskAction(parsed.data);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        setFormError(res.error);
        return;
      }
      onSaved(res.data);
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={submit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
      >
        <h2 id="task-form-title" className="font-display mb-4 text-xl font-bold">
          {task ? "Edit task" : "New task"}
        </h2>

        <label htmlFor="title" className="mb-1 block text-sm font-semibold">Title</label>
        <input
          ref={titleRef}
          id="title"
          name="title"
          defaultValue={task?.title}
          maxLength={120}
          className="field"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        {errors.title && <p id="title-error" className="mt-1 text-sm text-danger">{errors.title[0]}</p>}

        <label htmlFor="description" className="mb-1 mt-4 block text-sm font-semibold">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={task?.description}
          className="field"
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        {errors.description && <p id="description-error" className="mt-1 text-sm text-danger">{errors.description[0]}</p>}

        <label htmlFor="status" className="mb-1 mt-4 block text-sm font-semibold">Column</label>
        <select id="status" name="status" defaultValue={task?.status ?? defaultStatus} className="field">
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>

        {formError && <p role="alert" className="mt-4 text-sm text-danger">{formError}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending ? "Saving..." : task ? "Save changes" : "Add task"}
          </button>
        </div>
      </form>
    </div>
  );
}
