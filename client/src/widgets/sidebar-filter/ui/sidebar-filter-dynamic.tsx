"use client";
import dynamic from "next/dynamic";
import { SidebarFilterSkeleton } from "@/widgets/sidebar-filter/ui/sidebar-filter-skeleton";

export const SidebarFilterDynamic = dynamic(
  () => import("@/widgets/sidebar-filter/ui/sidebar-filter").then((mod) => mod.SidebarFilter),
  {
    ssr: false,
    loading: () => <SidebarFilterSkeleton />,
  },
);
