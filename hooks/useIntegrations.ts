/**
 * TanStack Query hooks for integration flags.
 *
 * staleTime: 5 minutes — integration flags rarely change.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Integrations {
  shopify: boolean;
  crm: boolean;
}

async function fetchIntegrations(): Promise<Integrations> {
  const res = await fetch("/api/integrations");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to fetch integrations");
  }
  const json = await res.json();
  return json.data;
}

async function updateIntegrations(integrations: Integrations): Promise<Integrations> {
  const res = await fetch("/api/integrations", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(integrations),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to update integrations");
  }
  const json = await res.json();
  return json.data;
}

export function useIntegrations() {
  return useQuery({
    queryKey: ["integrations"],
    queryFn: fetchIntegrations,
    staleTime: 5 * 60_000,       // 5 minutes — flags rarely change
    refetchOnWindowFocus: false,
  });
}

export function useUpdateIntegrations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateIntegrations,
    onSuccess: (data) => {
      // Update cache directly — no refetch
      queryClient.setQueryData(["integrations"], data);
      // Dashboard shows integration status — invalidate to reflect change
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
