/**
 * TanStack Query hooks for conversations.
 * Components use these hooks — never call fetch() directly.
 *
 * staleTime: 60s — conversations list doesn't need to be real-time
 * refetchOnWindowFocus: false — no surprise refetches (set globally in providers.tsx)
 */

"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Conversation {
  _id: string;
  projectId: string;
  productInstanceId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API Fetchers ─────────────────────────────────────────────────────────────

async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch("/api/conversations");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to fetch conversations");
  }
  const json = await res.json();
  return json.data;
}

async function createConversation(data: {
  productInstanceId: string;
  title?: string;
}): Promise<Conversation> {
  const res = await fetch("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to create conversation");
  }
  const json = await res.json();
  return json.data;
}

async function deleteConversation(conversationId: string): Promise<void> {
  const res = await fetch(`/api/conversations/${conversationId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete conversation");
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useConversations(): UseQueryResult<Conversation[]> {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    staleTime: 60_000,           // 60s — no spam on every render
    refetchOnWindowFocus: false,
  });
}

export function useCreateConversation(): UseMutationResult<
  Conversation,
  Error,
  { productInstanceId: string; title?: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createConversation,
    onSuccess: (newConv) => {
      // Optimistically prepend to cache instead of full refetch
      queryClient.setQueryData<Conversation[]>(["conversations"], (old = []) => [
        newConv,
        ...old,
      ]);
    },
  });
}

export function useDeleteConversation(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: (_data, deletedId) => {
      // Remove from cache directly — no refetch needed
      queryClient.setQueryData<Conversation[]>(["conversations"], (old = []) =>
        old.filter((c) => c._id !== deletedId)
      );
    },
  });
}
