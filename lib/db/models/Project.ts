/**
 * Project model — the top-level tenant boundary.
 * Every resource (users, conversations, etc.) belongs to a project.
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
