/**
 * Client-side providers wrapper.
 * Wraps the app with TanStack Query provider.
 *
 * Global defaults:
 *  - staleTime: 60s — prevents excessive refetching
 *  - refetchOnWindowFocus: false — no surprise refetches when switching tabs
 *  - retry: 1 — retry once on failure, not on 403s
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,          // 60s — data stays fresh, no spam
            refetchOnWindowFocus: false, // no refetch on tab switch
            refetchOnReconnect: true,    // do refetch on network reconnect
            retry: (failureCount, error) => {
              // Don't retry on auth errors (403/401)
              if (error instanceof Error && error.message.includes("FORBIDDEN")) return false;
              if (error instanceof Error && error.message.includes("UNAUTHORIZED")) return false;
              return failureCount < 1;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
