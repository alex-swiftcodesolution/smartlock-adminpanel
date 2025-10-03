"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Lock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/locks", label: "Locks", icon: Lock },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-gray-100/40 p-4 dark:bg-gray-800/40 md:flex">
      <div className="mb-6 flex items-center gap-2">
        <Lock className="h-6 w-6 text-primary" aria-hidden="true" />
        <h1 className="text-xl font-bold">LockAdmin</h1>
      </div>
      <nav className="flex flex-col gap-2" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                isActive &&
                  "bg-gray-200/50 text-gray-900 dark:bg-gray-700/50 dark:text-gray-50"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
