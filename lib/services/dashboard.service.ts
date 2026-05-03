/**
 * Dashboard Service — fetches config-driven dashboard data.
 *
 * The dashboard layout is stored in MongoDB (DashboardConfig).
 * Widget data is computed here and returned alongside the config.
 * The UI renders whatever sections/widgets the DB config specifies.
 */

import { connectDB } from "@/lib/db/mongoose";
import { DashboardConfig } from "@/lib/db/models/DashboardConfig";
import { User } from "@/lib/db/models/User";
import { Message } from "@/lib/db/models/Message";
import { Conversation } from "@/lib/db/models/Conversation";
import { ProductInstance } from "@/lib/db/models/ProductInstance";
import { Types } from "mongoose";
import type { DashboardConfigDoc, DashboardSectionDoc } from "@/lib/db/models/types";

function toObjectId(id: string, label = "id"): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${label}: "${id}" is not a valid MongoDB ObjectId`);
  }
  return new Types.ObjectId(id);
}

export interface WidgetData {
  [widgetName: string]: unknown;
}

export interface DashboardData {
  config: DashboardConfigDoc;
  widgetData: WidgetData;
}

/**
 * Computes data for all known widget types.
 * Add new widgets here — no UI code changes needed.
 */
async function computeWidgetData(projectId: string): Promise<WidgetData> {
  const pid = toObjectId(projectId, "projectId");

  const conversationIds = await Conversation.distinct("_id", { projectId: pid });

  const [userCount, messageCount, conversationCount, productInstance] = await Promise.all([
    User.countDocuments({ projectId: pid }),
    Message.countDocuments({ conversationId: { $in: conversationIds } }),
    Conversation.countDocuments({ projectId: pid }),
    ProductInstance.findOne({ projectId: pid }).lean<{
      integrations: { shopify: boolean; crm: boolean };
    }>(),
  ]);

  return {
    userCount: {
      label: "Total Users",
      value: userCount,
      icon: "users",
      color: "blue",
    },
    messageCount: {
      label: "Total Messages",
      value: messageCount,
      icon: "message-square",
      color: "green",
    },
    conversationCount: {
      label: "Conversations",
      value: conversationCount,
      icon: "messages-square",
      color: "purple",
    },
    integrationStatus: {
      label: "Integrations",
      shopify: productInstance?.integrations?.shopify ?? false,
      crm: productInstance?.integrations?.crm ?? false,
      icon: "plug",
      color: "orange",
    },
  };
}

/**
 * Fetches the dashboard config + widget data for a project.
 */
export async function getDashboardData(projectId: string): Promise<DashboardData> {
  await connectDB();

  const config = await DashboardConfig.findOne({
    projectId: toObjectId(projectId, "projectId"),
  }).lean<DashboardConfigDoc>();

  if (!config) {
    throw new Error("Dashboard config not found for this project");
  }

  const widgetData = await computeWidgetData(projectId);

  return { config, widgetData };
}

/**
 * Updates the dashboard config sections for a project.
 * This is how admins reconfigure the dashboard without code changes.
 */
export async function updateDashboardConfig(
  projectId: string,
  sections: DashboardSectionDoc[]
): Promise<DashboardConfigDoc> {
  await connectDB();

  const updated = await DashboardConfig.findOneAndUpdate(
    { projectId: toObjectId(projectId, "projectId") },
    { sections },
    { new: true, upsert: true }
  ).lean<DashboardConfigDoc>();

  return updated!;
}
