import type { Metadata, Viewport } from "next";
import localFont from "next/font/local"; // 1. Import localFont
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils"; // Import the cn utility

// 2. Define your custom font family
const fontSans = localFont({
  src: [
    {
      path: "../../public/fonts/regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/bold-italic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-sans", // 3. Assign it to the CSS variable that Tailwind/Shadcn uses
});

export const metadata: Metadata = {
  title: "LockAdmin Panel",
  description: "Manage your Tuya smart locks",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 4. Apply the font variable to the body */}
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
