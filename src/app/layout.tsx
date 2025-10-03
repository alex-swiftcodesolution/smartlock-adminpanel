import type { Metadata, Viewport } from "next"; // Import Viewport
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LockAdmin Panel",
  description: "Manage your Tuya smart locks",
};

// Add the viewport configuration here to prevent auto-zooming on input focus
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // This is the key property
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
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
