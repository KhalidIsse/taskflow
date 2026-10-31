import { Schema, model, models, type Model, type Types } from "mongoose";
import { STATUSES, type Status } from "@/lib/validation";

export interface ITask {
  title: string;
  description: string;
  status: Status;
  userId: Types.ObjectId;
  order: number;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", trim: true, maxlength: 1000 },
    status: { type: String, enum: [...STATUSES], default: "todo" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TaskSchema.index({ userId: 1, status: 1, order: 1 });

const Task: Model<ITask> = models.Task || model<ITask>("Task", TaskSchema);
export default Task;
