/**
 * ProductInstance model — represents a deployed AI product within a project.
 * Holds integration flags that control AI response behavior.
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ProductType = "AI_ASSISTANT";

export interface IIntegrations {
  shopify: boolean;
  crm: boolean;
}

export interface IProductInstance extends Document {
  projectId: Types.ObjectId;
  productType: ProductType;
  integrations: IIntegrations;
  createdAt: Date;
  updatedAt: Date;
}

const ProductInstanceSchema = new Schema<IProductInstance>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    productType: { type: String, enum: ["AI_ASSISTANT"], required: true, default: "AI_ASSISTANT" },
    integrations: {
      shopify: { type: Boolean, default: false },
      crm: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

ProductInstanceSchema.index({ projectId: 1 });

export const ProductInstance: Model<IProductInstance> =
  mongoose.models.ProductInstance ||
  mongoose.model<IProductInstance>("ProductInstance", ProductInstanceSchema);
