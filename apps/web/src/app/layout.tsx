import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OpsPilot - Diagnóstico Operacional Inteligente",
  description:
    "Agente de IA para empresas que processa solicitações em texto livre e devolve diagnóstico estruturado, plano de ação e respostas sugeridas.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-surface text-on-surface">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
