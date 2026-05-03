/**
 * TanStack Query hooks for messages within a conversation.
 *
 * staleTime: 30s — messages are mostly append-only; no need to refetch constantly.
 * Cache is updated optimistically on send (no extra GET after POST).
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Message {
  _id: string;
  conversationId: string;
  sender: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface SendMessageResult {
  userMessage: Message;
  assistantMessage: Message;
}

// ─── API Fetchers ─────────────────────────────────────────────────────────────

async function fetchMessages(conversationId: string): Promise<Message[]> {
  const res = await fetch(`/api/conversations/${conversationId}/messages`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to fetch messages");
  }
  const json = await res.json();
  return json.data;
}

async function sendMessage({
  conversationId,
  content,
}: {
  conversationId: string;
  content: string;
}): Promise<SendMessageResult> {
  const res = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to send message");
  }
  const json = await res.json();
  return json.data;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: 30_000,           // 30s — messages are append-only, no need to spam
    refetchOnWindowFocus: false,
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => sendMessage({ conversationId, content }),
    onSuccess: (result) => {
      // Append both messages to cache — no extra GET needed
      queryClient.setQueryData<Message[]>(
        ["messages", conversationId],
        (old = []) => [...old, result.userMessage, result.assistantMessage]
      );
      // Bump conversation list so updated title/timestamp shows
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
