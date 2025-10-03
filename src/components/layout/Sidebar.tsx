"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Lock, Settings, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InstallPWAButton } from "./InstallPWAButton";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/locks", label: "Locks", icon: Lock },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

// Animation variants for the navigation list
const navListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-background md:flex">
      <div className="flex h-full max-h-screen flex-col gap-2">
        {/* REFINED: Sidebar Header/Branding */}
        <div className="flex h-14 items-center border-b px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <Lock className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="">LockAdmin</span>
          </Link>
        </div>

        {/* REFINED: Main Navigation with grow */}
        <div className="flex-1 overflow-auto py-2">
          <motion.nav
            className="grid items-start gap-1 px-4 text-sm font-medium"
            aria-label="Main navigation"
            variants={navListVariants}
            initial="hidden"
            animate="visible"
          >
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <motion.div key={item.href} variants={navItemVariants}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted/50 hover:text-primary",
                      isActive && "bg-muted text-primary"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                </motion.div>
              );
            })}
          </motion.nav>
        </div>

        {/* NEW: Sticky Footer Section */}
        <div className="mt-auto p-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>
                Contact our support team for assistance.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <InstallPWAButton isFullWidth={true} />
              <Button size="sm" className="w-full">
                <LifeBuoy className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </aside>
  );
}
