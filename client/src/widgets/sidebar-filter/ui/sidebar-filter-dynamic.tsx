"use client";
import dynamic from "next/dynamic";
import { SidebarFilterSkeleton } from "@/widgets/sidebar-filter/ui/sidebar-filter-skeleton";

// `dynamic(..., { ssr: false })` is only allowed inside a Client Component, so
// this thin wrapper isolates the client boundary and lets the home shell stay
// a Server Component.
export const SidebarFilterDynamic = dynamic(
  () => import("@/widgets/sidebar-filter/ui/sidebar-filter").then((mod) => mod.SidebarFilter),
  {
    ssr: false,
    loading: () => <SidebarFilterSkeleton />,
  },
);
