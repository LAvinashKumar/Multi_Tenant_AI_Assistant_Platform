/**
 * DashboardConfig model — drives the admin dashboard layout.
 * Sections and widgets are stored in MongoDB; the UI renders them dynamically.
 * Changing this document changes the dashboard WITHOUT any code changes.
 *
 * Example document:
 * {
 *   projectId: ObjectId("..."),
 *   sections: [
 *     { title: "Overview", widgets: ["userCount", "messageCount"] },
 *     { title: "Integrations", widgets: ["integrationStatus"] }
 *   ]
 * }
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IDashboardSection {
  title: string;
  widgets: string[];
}

export interface IDashboardConfig extends Document {
  projectId: Types.ObjectId;
  sections: IDashboardSection[];
  createdAt: Date;
  updatedAt: Date;
}

const DashboardSectionSchema = new Schema<IDashboardSection>(
  {
    title: { type: String, required: true },
    widgets: [{ type: String }],
  },
  { _id: false }
);

const DashboardConfigSchema = new Schema<IDashboardConfig>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, unique: true },
    sections: [DashboardSectionSchema],
  },
  { timestamps: true }
);

export const DashboardConfig: Model<IDashboardConfig> =
  mongoose.models.DashboardConfig ||
  mongoose.model<IDashboardConfig>("DashboardConfig", DashboardConfigSchema);
