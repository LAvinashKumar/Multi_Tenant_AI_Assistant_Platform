/**
 * ChatWindow — the main chat interface for a conversation.
 *
 * - Renders message list with fade-in animation
 * - Shows typing indicator while AI responds
 * - Auto-scrolls to latest message
 * - Uses TanStack Query hooks exclusively (no direct fetch)
 */

"use client";

import { useEffect, useRef } from "react";
import { useMessages, useSendMessage } from "@/hooks/useMessages";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { LoadingPage } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Bot } from "lucide-react";

interface ChatWindowProps {
  conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: messages, isLoading, error, refetch } = useMessages(conversationId);
  const sendMutation = useSendMessage(conversationId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length, sendMutation.isPending]);

  if (isLoading) return <LoadingPage />;

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <ErrorMessage message={error.message} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div data-testid="chat-window" className="flex h-full flex-col bg-slate-50">
      {/* ── Message List ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {messages?.length === 0 && (
          <EmptyState
            title="Start a conversation"
            description="Ask anything — the AI assistant is ready to help."
            icon={<Bot className="h-8 w-8" />}
          />
        )}

        {messages?.map((message) => (
          <MessageBubble key={message._id} message={message} />
        ))}

        {sendMutation.isPending && <TypingIndicator />}

        {sendMutation.error && (
          <div className="mx-auto max-w-md">
            <ErrorMessage message={sendMutation.error.message} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <MessageInput
        onSend={(content) => sendMutation.mutate(content)}
        isLoading={sendMutation.isPending}
      />
    </div>
  );
}
