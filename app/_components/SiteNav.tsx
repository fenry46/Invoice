"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Fish, Home, Plus, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Returns true when `href` is the section the current route belongs to.
 *  `/invoices` deliberately excludes `/invoices/new` so the prominent "Baru"
 *  tab owns that route on its own. */
function useIsActive() {
  const pathname = usePathname();
  return (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/invoices") {
      return (
        pathname === "/invoices" ||
        (pathname.startsWith("/invoices/") &&
          !pathname.startsWith("/invoices/new"))
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };
}

const DESKTOP_LINKS = [
  { href: "/fish", label: "Ikan" },
  { href: "/customers", label: "Pelanggan" },
  { href: "/invoices", label: "Faktur" },
];

/** Desktop-only (`sm:`+) top-nav links with an active-page highlight.
 *  On mobile the bottom tab bar takes over, so these are hidden. */
export function DesktopNavLinks() {
  const isActive = useIsActive();
  return (
    <div className="hidden items-center gap-0.5 text-sm sm:flex">
      {DESKTOP_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            isActive(href) && "bg-accent text-foreground",
          )}
        >
          {label}
        </Link>
      ))}
      <Link
        href="/invoices/new"
        className="ml-1 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        <Plus className="size-4" aria-hidden />
        Baru
      </Link>
    </div>
  );
}

type Tab = { href: string; label: string; icon: LucideIcon; primary?: boolean };

const TABS: Tab[] = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/invoices", label: "Faktur", icon: FileText },
  { href: "/invoices/new", label: "Baru", icon: Plus, primary: true },
  { href: "/fish", label: "Ikan", icon: Fish },
  { href: "/customers", label: "Pelanggan", icon: Users },
];

/** Thumb-reachable bottom tab bar for mobile (hidden on `sm:`+ where the top
 *  nav is shown). Respects the iOS home-indicator safe area. */
export function BottomNav() {
  const isActive = useIsActive();
  return (
    <nav
      aria-label="Navigasi utama"
      className="no-print fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-3xl items-stretch justify-around">
        {TABS.map(({ href, label, icon: Icon, primary }) => {
          const active = isActive(href);
          if (primary) {
            return (
              <li key={href} className="flex flex-1 items-center justify-center">
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className="flex size-12 -translate-y-3 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background transition-transform active:scale-95"
                >
                  <Plus className="size-6" aria-hidden />
                </Link>
              </li>
            );
          }
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-13 flex-col items-center justify-center gap-1 py-2 text-[0.65rem] font-medium text-muted-foreground transition-colors active:bg-accent",
                  active && "text-primary",
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
