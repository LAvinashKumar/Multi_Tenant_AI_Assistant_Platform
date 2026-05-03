/**
 * TanStack Query hook for the current user session.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Session {
  userId: string;
  projectId: string;
  role: "admin" | "member";
  name: string;
}

async function fetchSession(): Promise<Session | null> {
  const res = await fetch("/api/session");
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

async function switchUser(userId: string): Promise<void> {
  await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
}

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: Infinity,
  });
}

export function useSwitchUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: switchUser,
    onSuccess: () => {
      // Invalidate everything on user switch
      queryClient.clear();
      window.location.reload();
    },
  });
}
