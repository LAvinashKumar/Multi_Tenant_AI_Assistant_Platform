/**
 * Conversation Service — CRUD for conversations and message listing.
 *
 * Message sending (with AI) is handled by chat.service.ts.
 * This service handles: list, create, delete conversations + list messages.
 *
 * All DB operations live here. API routes never touch the DB directly.
 */

import { connectDB } from "@/lib/db/mongoose";
import { Conversation } from "@/lib/db/models/Conversation";
import { Message } from "@/lib/db/models/Message";
import { assertProjectAccess, assertConversationAccess } from "@/lib/access/authorization";
import { Session } from "@/lib/access/session";
import { Types } from "mongoose";
import type { ConversationDoc, MessageDoc } from "@/lib/db/models/types";

/** Safely converts a string to ObjectId — throws a clear error if invalid. */
function toObjectId(id: string, label = "id"): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${label}: "${id}" is not a valid MongoDB ObjectId`);
  }
  return new Types.ObjectId(id);
}

// ─── Conversation CRUD ────────────────────────────────────────────────────────

/**
 * Lists all conversations for the session user's project, sorted newest first.
 * Authorization: enforced via projectId scoping — users only see their project's data.
 */
export async function listConversations(projectId: string): Promise<ConversationDoc[]> {
  await connectDB();
  return Conversation.find({ projectId: toObjectId(projectId, "projectId") })
    .sort({ updatedAt: -1 })
    .lean<ConversationDoc[]>();
}

/**
 * Gets a single conversation by ID, verifying it belongs to the project.
 */
export async function getConversation(
  conversationId: string,
  projectId: string
): Promise<ConversationDoc | null> {
  await connectDB();
  return Conversation.findOne({
    _id: toObjectId(conversationId, "conversationId"),
    projectId: toObjectId(projectId, "projectId"),
  }).lean<ConversationDoc>();
}

/**
 * Creates a new conversation for a project + product instance.
 * Authorization: asserts user belongs to the project.
 */
export async function createConversation(
  projectId: string,
  productInstanceId: string,
  session: Session,
  title?: string
): Promise<ConversationDoc> {
  // Enforce: user can only create conversations in their own project
  assertProjectAccess(session, projectId);

  await connectDB();
  const conversation = await Conversation.create({
    projectId: toObjectId(projectId, "projectId"),
    productInstanceId: toObjectId(productInstanceId, "productInstanceId"),
    title: title ?? "New Conversation",
  });
  return conversation.toObject() as ConversationDoc;
}

/**
 * Deletes a conversation and all its messages.
 * Authorization: enforced via projectId scoping.
 */
export async function deleteConversation(
  conversationId: string,
  projectId: string
): Promise<void> {
  await connectDB();
  await Conversation.deleteOne({
    _id: toObjectId(conversationId, "conversationId"),
    projectId: toObjectId(projectId, "projectId"),
  });
  await Message.deleteMany({ conversationId: toObjectId(conversationId, "conversationId") });
}

// ─── Message Listing ──────────────────────────────────────────────────────────

/**
 * Lists all messages in a conversation, sorted oldest first.
 * Verifies the conversation belongs to the user's project before returning.
 */
export async function listMessages(
  conversationId: string,
  projectId: string
): Promise<MessageDoc[]> {
  await connectDB();

  // Verify conversation belongs to this project (authorization via data scoping)
  const conversation = await Conversation.findOne({
    _id: toObjectId(conversationId, "conversationId"),
    projectId: toObjectId(projectId, "projectId"),
  }).lean<{ projectId: Types.ObjectId }>();

  if (!conversation) {
    throw new Error("Conversation not found or access denied");
  }

  return Message.find({ conversationId: toObjectId(conversationId, "conversationId") })
    .sort({ createdAt: 1 })
    .lean<MessageDoc[]>();
}
