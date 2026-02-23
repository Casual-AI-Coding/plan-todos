"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * React Query Provider
 * Provides query client context for data fetching
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 5 minutes - data stays fresh for 5 minutes before refetching
            staleTime: 5 * 60 * 1000,
            // Cache time: 10 minutes - unused data is garbage collected after 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry: 3 times on failure
            retry: 3,
            // Refetch on window focus
            refetchOnWindowFocus: true,
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
