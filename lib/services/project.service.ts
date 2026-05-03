/**
 * Project Service — manages project and product instance data.
 */

import { connectDB } from "@/lib/db/mongoose";
import { Project } from "@/lib/db/models/Project";
import { ProductInstance } from "@/lib/db/models/ProductInstance";
import { User } from "@/lib/db/models/User";
import { Types } from "mongoose";
import type { ProjectDoc, ProductInstanceDoc, UserDoc } from "@/lib/db/models/types";

function toObjectId(id: string, label = "id"): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${label}: "${id}" is not a valid MongoDB ObjectId`);
  }
  return new Types.ObjectId(id);
}

/**
 * Gets a project by its MongoDB ID.
 */
export async function getProject(projectId: string): Promise<ProjectDoc | null> {
  await connectDB();
  return Project.findById(toObjectId(projectId, "projectId")).lean<ProjectDoc>();
}

/**
 * Gets the ProductInstance for a project.
 */
export async function getProductInstance(
  projectId: string
): Promise<ProductInstanceDoc | null> {
  await connectDB();
  return ProductInstance.findOne({
    projectId: toObjectId(projectId, "projectId"),
  }).lean<ProductInstanceDoc>();
}

/**
 * Updates integration flags on a ProductInstance.
 */
export async function updateIntegrations(
  projectId: string,
  integrations: { shopify?: boolean; crm?: boolean }
): Promise<ProductInstanceDoc> {
  await connectDB();

  const updated = await ProductInstance.findOneAndUpdate(
    { projectId: toObjectId(projectId, "projectId") },
    {
      $set: {
        "integrations.shopify": integrations.shopify,
        "integrations.crm": integrations.crm,
      },
    },
    { new: true }
  ).lean<ProductInstanceDoc>();

  if (!updated) {
    throw new Error("ProductInstance not found");
  }

  return updated;
}

/**
 * Lists all users in a project.
 */
export async function listUsers(projectId: string): Promise<UserDoc[]> {
  await connectDB();
  return User.find({ projectId: toObjectId(projectId, "projectId") }).lean<UserDoc[]>();
}
