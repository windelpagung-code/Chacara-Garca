import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/modules/SessionProvider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Chácara Garça",
  description: "Espaço para eventos, festas e reuniões em meio à natureza.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>
        <SessionProvider>
          {children}
          <Toaster position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
