import type { Metadata } from "next";
import { ReactNode } from "react";
import { AdminShell } from "@/views/admin/layout/ui/admin-shell";

export const metadata: Metadata = {
  title: "404 Pizza | Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
