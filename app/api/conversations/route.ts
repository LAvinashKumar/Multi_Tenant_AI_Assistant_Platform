/**
 * GET  /api/conversations — list conversations for the current project
 * POST /api/conversations — create a new conversation
 *
 * Thin controller: validate → delegate to service (auth enforced in service).
 */

import { NextRequest } from "next/server";
import { requireSession } from "@/lib/access/session";
import { listConversations, createConversation } from "@/lib/services/conversation.service";
import { CreateConversationSchema } from "@/lib/validations/schemas";
import { successResponse, withErrorHandling } from "@/lib/api-helpers";

export async function GET() {
  return withErrorHandling(async () => {
    const session = await requireSession();
    const conversations = await listConversations(session.projectId);
    return successResponse(conversations);
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const session = await requireSession();
    const body = await req.json();
    const { productInstanceId, title } = CreateConversationSchema.parse(body);

    // Authorization enforced inside createConversation
    const conversation = await createConversation(
      session.projectId,
      productInstanceId,
      session,
      title
    );
    return successResponse(conversation, 201);
  });
}
