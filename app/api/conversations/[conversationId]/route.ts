/**
 * DELETE /api/conversations/[conversationId] — delete a conversation
 */

import { NextRequest } from "next/server";
import { requireSession } from "@/lib/access/session";
import { deleteConversation } from "@/lib/services/conversation.service";
import { ConversationParamsSchema } from "@/lib/validations/schemas";
import { successResponse, withErrorHandling } from "@/lib/api-helpers";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  return withErrorHandling(async () => {
    const session = await requireSession();
    const { conversationId } = ConversationParamsSchema.parse(params);

    await deleteConversation(conversationId, session.projectId);
    return successResponse({ deleted: true });
  });
}
