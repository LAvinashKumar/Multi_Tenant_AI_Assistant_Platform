/**
 * Message model — individual chat messages within a conversation.
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type MessageSender = "user" | "assistant";

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  sender: MessageSender;
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
