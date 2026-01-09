import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "@/app/providers/auth-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { QueryProvider } from "@/app/providers/query-provider";

const nunito = Nunito({
  variable: "--font-nunito-sans",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["cyrillic"],
});

export const metadata: Metadata = {
  title: "Dodo Pizza",
  description: "Dodo Pizza Client Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${nunito.className} antialiased`}>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
