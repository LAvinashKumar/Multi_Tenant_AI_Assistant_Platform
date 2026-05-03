/**
 * /chat/[conversationId] — individual conversation page.
 */

import { ChatWindow } from "@/components/chat/ChatWindow";
import { Sidebar } from "@/components/layout/Sidebar";

interface ConversationPageProps {
  params: { conversationId: string };
}

export default function ConversationPage({ params }: ConversationPageProps) {
  return <ChatWindow conversationId={params.conversationId} />;
}
