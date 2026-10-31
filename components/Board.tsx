"use client";

import { useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { deleteTaskAction, moveTaskAction } from "@/app/actions";
import { STATUSES, type Status } from "@/lib/validation";
import type { TaskDTO } from "@/lib/types";
import TaskForm from "./TaskForm";

type Columns = Record<Status, TaskDTO[]>;

const META: Record<Status, { label: string; dot: string }> = {
  todo: { label: "To do", dot: "bg-muted" },
  in_progress: { label: "In progress", dot: "bg-doing" },
  done: { label: "Done", dot: "bg-brand" },
};

const group = (tasks: TaskDTO[]): Columns => ({
  todo: tasks.filter((t) => t.status === "todo"),
  in_progress: tasks.filter((t) => t.status === "in_progress"),
  done: tasks.filter((t) => t.status === "done"),
});

const findContainer = (id: string, cols: Columns): Status | undefined =>
  (STATUSES as readonly string[]).includes(id)
    ? (id as Status)
    : STATUSES.find((s) => cols[s].some((t) => t.id === id));

function CardBody({
  task,
  onEdit,
  onDelete,
  overlay,
}: {
  task: TaskDTO;
  onEdit?: () => void;
  onDelete?: () => void;
  overlay?: boolean;
}) {
  // Stop drag from starting when the person uses the buttons.
  const stop = {
    onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
    onKeyDown: (e: React.KeyboardEvent) => e.stopPropagation(),
  };
  return (
    <div
      className={`rounded-lg border border-line bg-white p-3 ${
        overlay ? "rotate-2 cursor-grabbing border-brand shadow-xl" : "cursor-grab"
      }`}
    >
      <p className="break-words font-semibold leading-snug">{task.title}</p>
      {task.description && <p className="mt-1 line-clamp-3 break-words text-sm text-muted">{task.description}</p>}
      {!overlay && (
        <div className="mt-2 flex gap-3 text-sm">
          <button {...stop} onClick={onEdit} className="font-medium text-brand underline">Edit</button>
          <button {...stop} onClick={onDelete} className="font-medium text-danger underline">Delete</button>
        </div>
      )}
    </div>
  );
}

function SortableCard(props: { task: TaskDTO; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.task.id });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={isDragging ? "opacity-40" : ""}>
      <div {...attributes} {...listeners} className="touch-manipulation rounded-lg">
        <CardBody {...props} />
      </div>
    </li>
  );
}

function Column({
  status,
  tasks,
  onAdd,
  onEdit,
  onDelete,
}: {
  status: Status;
  tasks: TaskDTO[];
  onAdd: () => void;
  onEdit: (t: TaskDTO) => void;
  onDelete: (t: TaskDTO) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const { label, dot } = META[status];
  return (
    <section aria-label={label} className={`rounded-xl p-3 transition-colors ${isOver ? "bg-white/80" : "bg-white/50"}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display font-bold">
          <span className={`size-2.5 rounded-full ${dot}`} />
          {label}
          <span className="text-sm font-normal text-muted">{tasks.length}</span>
        </h2>
        <button onClick={onAdd} className="btn btn-outline !px-2.5 !py-1" aria-label={`Add task to ${label}`}>
          Add
        </button>
      </div>
      <SortableContext id={status} items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="flex min-h-24 flex-col gap-2">
          {tasks.map((t) => (
            <SortableCard key={t.id} task={t} onEdit={() => onEdit(t)} onDelete={() => onDelete(t)} />
          ))}
          {tasks.length === 0 && (
            <li className="rounded-lg border border-dashed border-line p-4 text-center text-sm text-muted">
              Nothing here yet. Drag a task in or add one.
            </li>
          )}
        </ul>
      </SortableContext>
    </section>
  );
}

export default function Board({ initial, greeting }: { initial: TaskDTO[]; greeting: string }) {
  const [columns, setColumns] = useState<Columns>(() => group(initial));
  const [active, setActive] = useState<TaskDTO | null>(null);
  const [form, setForm] = useState<{ task?: TaskDTO; status: Status } | null>(null);
  const [toast, setToast] = useState("");
  const snapshot = useRef<Columns>(columns);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function showToast(msg: string) {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 4000);
  }

  function onDragStart({ active }: DragStartEvent) {
    snapshot.current = columns;
    const id = String(active.id);
    const from = findContainer(id, columns);
    setActive(from ? columns[from].find((t) => t.id === id) ?? null : null);
  }

  // Moving between columns happens live, while dragging.
  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const from = findContainer(activeId, columns);
    const to = findContainer(overId, columns);
    if (!from || !to || from === to) return;

    setColumns((prev) => {
      const moving = prev[from].find((t) => t.id === activeId);
      if (!moving) return prev;
      const target = prev[to];
      let index = target.length;
      if (overId !== to) {
        const overIndex = target.findIndex((t) => t.id === overId);
        const translated = active.rect.current.translated;
        const below = !!translated && translated.top > over.rect.top + over.rect.height / 2;
        index = overIndex + (below ? 1 : 0);
      }
      return {
        ...prev,
        [from]: prev[from].filter((t) => t.id !== activeId),
        [to]: [...target.slice(0, index), { ...moving, status: to }, ...target.slice(index)],
      };
    });
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActive(null);
    const before = snapshot.current;
    if (!over) return setColumns(before);

    const activeId = String(active.id);
    const overId = String(over.id);
    const status = findContainer(activeId, columns);
    if (!status) return setColumns(before);

    let next = columns;
    if (overId !== activeId && overId !== status) {
      const oldIndex = columns[status].findIndex((t) => t.id === activeId);
      const newIndex = columns[status].findIndex((t) => t.id === overId);
      if (newIndex >= 0) {
        next = { ...columns, [status]: arrayMove(columns[status], oldIndex, newIndex) };
        setColumns(next);
      }
    }

    const index = next[status].findIndex((t) => t.id === activeId);
    const startStatus = findContainer(activeId, before);
    if (startStatus === status && before[status].findIndex((t) => t.id === activeId) === index) return;

    // Optimistic: the UI already moved. Roll back if the server says no.
    moveTaskAction(activeId, status, index).then((res) => {
      if (!res.ok) {
        setColumns(before);
        showToast(res.error);
      }
    });
  }

  function onDragCancel() {
    setActive(null);
    setColumns(snapshot.current);
  }

  function saved(task: TaskDTO) {
    setColumns((prev) => {
      const next = { ...prev };
      let replaced = false;
      for (const s of STATUSES) {
        next[s] = prev[s].flatMap((t) => {
          if (t.id !== task.id) return [t];
          if (s === task.status) {
            replaced = true;
            return [task];
          }
          return [];
        });
      }
      if (!replaced) next[task.status] = [...next[task.status], task];
      return next;
    });
  }

  function remove(task: TaskDTO) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    const before = columns;
    setColumns((prev) => ({ ...prev, [task.status]: prev[task.status].filter((t) => t.id !== task.id) }));
    deleteTaskAction(task.id).then((res) => {
      if (!res.ok) {
        setColumns(before);
        showToast(res.error);
      }
    });
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">{greeting}</h1>
        <button onClick={() => setForm({ status: "todo" })} className="btn btn-primary">New task</button>
      </div>

      <DndContext
        id="taskflow-board"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <div className="grid items-start gap-4 md:grid-cols-3">
          {STATUSES.map((s) => (
            <Column
              key={s}
              status={s}
              tasks={columns[s]}
              onAdd={() => setForm({ status: s })}
              onEdit={(task) => setForm({ task, status: task.status })}
              onDelete={remove}
            />
          ))}
        </div>
        <DragOverlay>{active ? <CardBody task={active} overlay /> : null}</DragOverlay>
      </DndContext>

      {form && (
        <TaskForm
          task={form.task}
          defaultStatus={form.status}
          onClose={() => setForm(null)}
          onSaved={saved}
        />
      )}

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 flex justify-center px-4">
        {toast && <p className="rounded-lg bg-ink px-4 py-2 text-sm text-white shadow-lg">{toast}</p>}
      </div>
    </>
  );
}
