import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, AuthProvider } from "@/components/providers";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taskforge.shivadhar.com";

export const metadata: Metadata = {
  title: "TaskForge — Distributed Job Processing",
  description:
    "Create, schedule, monitor, retry, and inspect background jobs from one clean dashboard.",
  metadataBase: new URL(siteUrl),
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "TaskForge — Distributed Job Processing",
    description:
      "Create, schedule, monitor, retry, and inspect background jobs from one clean dashboard.",
    type: "website",
    siteName: "TaskForge",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className="min-h-full flex flex-col antialiased"
        style={{
          fontFamily:
            '"Segoe UI", "Segoe UI Web (West European)", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
        }}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            <AuthProvider>{children}</AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
