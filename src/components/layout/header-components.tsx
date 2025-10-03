"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState, memo } from "react";
import { Home, Lock, Menu, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ModeToggleSimple } from "./ModeToggleSimple";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/locks", label: "Locks", icon: Lock },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

/**
 * MobileNav: Mobile navigation with auto-closing sheet.
 */
export const MobileNav = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="sm:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav
          className="grid gap-6 text-lg font-medium"
          aria-label="Mobile navigation"
        >
          <Link
            href="/dashboard"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground"
            onClick={() => setIsOpen(false)}
            aria-label="LockAdmin Home"
          >
            <Lock
              className="h-5 w-5 transition-all group-hover:scale-110"
              aria-hidden="true"
            />
          </Link>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                pathname === item.href && "text-foreground"
              )}
              onClick={() => setIsOpen(false)}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
});
MobileNav.displayName = "MobileNav";

/**
 * UserNav: User avatar with dropdown menu.
 */
export function UserNav() {
  return (
    <div className="flex gap-4 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label="User menu"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src="/avatars/01.png" alt="User avatar" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/">Logout</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ModeToggleSimple />
    </div>
  );
}

/**
 * AppBreadcrumbs: Dynamic breadcrumbs from URL.
 */
export function AppBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (!segments.length) return null;

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const label = segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
