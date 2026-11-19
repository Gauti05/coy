"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Home } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home, match: (pathname: string) => pathname === "/" },
  {
    href: "/discover",
    label: "Discover",
    icon: Flame,
    match: (pathname: string) =>
      pathname === "/discover" || pathname.startsWith("/discover/"),
  },
] as const;

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="shrink-0 border-t border-border bg-surface"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <ul
        className="grid grid-cols-2"
        style={{ height: "var(--tab-bar-height)" }}
      >
        {tabs.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);

          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  active ? "text-primary" : "text-muted hover:text-text",
                ].join(" ")}
              >
                <Icon
                  aria-hidden
                  className="h-5 w-5"
                  strokeWidth={active ? 2.5 : 2}
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
