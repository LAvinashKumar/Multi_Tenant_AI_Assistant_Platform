/**
 * Conversation model — a chat thread scoped to a project + product instance.
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IConversation extends Document {
  projectId: Types.ObjectId;
  productInstanceId: Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    productInstanceId: { type: Schema.Types.ObjectId, ref: "ProductInstance", required: true },
    title: { type: String, default: "New Conversation", trim: true },
  },
  { timestamps: true }
);

ConversationSchema.index({ projectId: 1, productInstanceId: 1 });

export const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);
