import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils";

const fontSans = localFont({
  src: [
    { path: "../../public/fonts/regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/italic.ttf", weight: "400", style: "italic" },
    { path: "../../public/fonts/bold.ttf", weight: "700", style: "normal" },
    {
      path: "../../public/fonts/bold-italic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-sans",
});

// REFINED: Add PWA-specific metadata
export const metadata: Metadata = {
  title: "LockAdmin Panel",
  description: "Manage your Tuya smart locks",
  manifest: "/manifest.json", // Link to the manifest file
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LockAdmin",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0a", // Match your manifest theme_color
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
