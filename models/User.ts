import { Schema, model, models, type Model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  image: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);
export default User;
