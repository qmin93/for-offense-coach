import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "ForOffenseCoach - Football Playbook Builder",
  description: "Build football plays, get concept recommendations, and export playbooks",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = "en";
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-background">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <TooltipProvider delayDuration={300}>
            {children}
          </TooltipProvider>
          <Toaster position="bottom-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
