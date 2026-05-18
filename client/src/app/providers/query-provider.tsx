"use client";
import { ReactNode, useState } from "react";
import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { handleApiError } from "@/shared/lib/handle-api-error";

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 10 * 10,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            onError: handleApiError,
          },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
