/**
 * GET  /api/conversations/[conversationId]/messages — list messages
 * POST /api/conversations/[conversationId]/messages — send a message + get AI reply
 *
 * Thin controller: validate → auth → delegate to service.
 * All business logic and authorization lives in chat.service.ts.
 */

import { NextRequest } from "next/server";
import { requireSession } from "@/lib/access/session";
import { assertConversationAccess } from "@/lib/access/authorization";
import { listMessages } from "@/lib/services/conversation.service";
import { handleUserMessage } from "@/lib/services/chat.service";
import { SendMessageSchema, ConversationParamsSchema } from "@/lib/validations/schemas";
import { successResponse, withErrorHandling } from "@/lib/api-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  return withErrorHandling(async () => {
    const session = await requireSession();
    const { conversationId } = ConversationParamsSchema.parse(params);

    // Authorization is enforced inside listMessages via projectId scoping
    const messages = await listMessages(conversationId, session.projectId);
    return successResponse(messages);
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  return withErrorHandling(async () => {
    const session = await requireSession();
    const { conversationId } = ConversationParamsSchema.parse(params);
    const body = await req.json();
    const { content } = SendMessageSchema.parse(body);

    // Full flow: auth + save + AI + respond — all in chat.service
    const result = await handleUserMessage(conversationId, content, session);
    return successResponse(result, 201);
  });
}
