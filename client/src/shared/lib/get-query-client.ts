import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";

const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 10 * 10,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    }),
);

export default getQueryClient;
