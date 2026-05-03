/**
 * TanStack Query hooks for the admin dashboard.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardSection {
  title: string;
  widgets: string[];
}

export interface DashboardConfig {
  _id: string;
  projectId: string;
  sections: DashboardSection[];
}

export interface WidgetData {
  [key: string]: unknown;
}

export interface DashboardData {
  config: DashboardConfig;
  widgetData: WidgetData;
}

// ─── API Fetchers ─────────────────────────────────────────────────────────────

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch("/api/dashboard");
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to fetch dashboard");
  }
  const json = await res.json();
  return json.data;
}

async function updateDashboardConfig(sections: DashboardSection[]): Promise<DashboardConfig> {
  const res = await fetch("/api/dashboard", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sections }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to update dashboard config");
  }
  const json = await res.json();
  return json.data;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 60_000,
    retry: false, // Don't retry on 403 (non-admin users)
  });
}

export function useUpdateDashboardConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDashboardConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
