/**
 * Chat Service — orchestrates the full message send flow.
 *
 * This is the single entry point for sending a message. It:
 *  1. Validates the user has access to the conversation (authorization)
 *  2. Saves the user message
 *  3. Loads conversation history for AI context
 *  4. Checks integration flags (Shopify / CRM)
 *  5. Routes to mock data OR real AI API accordingly
 *  6. Saves and returns the assistant response
 *
 * AI calls are ONLY made from this service — never from routes or UI.
 */

import { connectDB } from "@/lib/db/mongoose";
import { Conversation } from "@/lib/db/models/Conversation";
import { Message } from "@/lib/db/models/Message";
import { ProductInstance } from "@/lib/db/models/ProductInstance";
import { generateAIResponse, AIMessage } from "./ai.service";
import { assertConversationAccess } from "@/lib/access/authorization";
import { Session } from "@/lib/access/session";
import { Types } from "mongoose";
import type { MessageDoc } from "@/lib/db/models/types";

function toObjectId(id: string, label = "id"): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${label}: "${id}" is not a valid MongoDB ObjectId`);
  }
  return new Types.ObjectId(id);
}

export interface SendMessageResult {
  userMessage: MessageDoc;
  assistantMessage: MessageDoc;
}

/**
 * Handles the full user message → AI response flow.
 *
 * Authorization is enforced here in the service layer, not in the route.
 */
export async function handleUserMessage(
  conversationId: string,
  content: string,
  session: Session
): Promise<SendMessageResult> {
  await connectDB();

  // 1. Load conversation and enforce authorization
  const conversation = await Conversation.findById(
    toObjectId(conversationId, "conversationId")
  ).lean<{ _id: Types.ObjectId; projectId: Types.ObjectId; productInstanceId: Types.ObjectId }>();

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // Enforce: conversation must belong to the user's project
  assertConversationAccess(session, conversation.projectId.toString());

  // 2. Save user message
  const userMessage = await Message.create({
    conversationId: toObjectId(conversationId, "conversationId"),
    sender: "user",
    content,
  });

  // 3. Load recent history for AI context (last 10 messages, excluding the one just saved)
  const recentMessages = await Message.find({
    conversationId: toObjectId(conversationId, "conversationId"),
    _id: { $ne: userMessage._id },
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean<MessageDoc[]>();

  const history: AIMessage[] = recentMessages
    .reverse()
    .map((m) => ({ role: m.sender as "user" | "assistant", content: m.content }));

  // 4. Load integration flags from ProductInstance
  const productInstance = await ProductInstance.findById(
    conversation.productInstanceId
  ).lean<{ integrations: { shopify: boolean; crm: boolean } }>();

  const integrations = productInstance?.integrations ?? { shopify: false, crm: false };

  // 5. Generate AI response — never throws, always returns a string
  const aiResponseText = await generateAIResponse(content, history, integrations);

  // 6. Save assistant message
  const assistantMessage = await Message.create({
    conversationId: toObjectId(conversationId, "conversationId"),
    sender: "assistant",
    content: aiResponseText,
  });

  // 7. Update conversation title from first user message, or bump updatedAt
  const messageCount = await Message.countDocuments({
    conversationId: toObjectId(conversationId, "conversationId"),
  });

  if (messageCount <= 2) {
    await Conversation.findByIdAndUpdate(conversationId, {
      title: content.slice(0, 60) + (content.length > 60 ? "…" : ""),
    });
  } else {
    await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });
  }

  return {
    userMessage: userMessage.toObject() as MessageDoc,
    assistantMessage: assistantMessage.toObject() as MessageDoc,
  };
}
