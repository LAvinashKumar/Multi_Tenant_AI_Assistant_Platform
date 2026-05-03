/**
 * User model — scoped to a project (tenant).
 * Role determines access: "admin" can view the admin dashboard,
 * "member" can only use the chat.
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type UserRole = "admin" | "member";

export interface IUser extends Document {
  name: string;
  role: UserRole;
  projectId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["admin", "member"], required: true, default: "member" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  },
  { timestamps: true }
);

// Index for fast tenant-scoped lookups
UserSchema.index({ projectId: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
