import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "@/app/providers/auth-provider";
import { QueryProvider } from "@/app/providers/query-provider";
import { Toaster } from "react-hot-toast";

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
  modal,
}: Readonly<{
  children: ReactNode;
  modal: ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${nunito.className} antialiased`}>
        <QueryProvider>
          <AuthProvider>
            {children}
            {modal}
          </AuthProvider>
          <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
        </QueryProvider>
      </body>
    </html>
  );
}
