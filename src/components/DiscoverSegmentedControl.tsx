"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const segments = [
  { href: "/discover", label: "Swipe", exact: true },
  { href: "/discover/matches", label: "Matches", exact: false },
] as const;

export function DiscoverSegmentedControl() {
  const pathname = usePathname();

  return (
    <div className="shrink-0 border-b border-border bg-surface px-4 pb-3 pt-4">
      <div
        role="tablist"
        aria-label="Discover views"
        className="grid grid-cols-2 rounded-xl bg-background p-1"
      >
        {segments.map(({ href, label, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              role="tab"
              aria-selected={active}
              aria-current={active ? "page" : undefined}
              className={[
                "flex min-h-[44px] items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                active
                  ? "bg-surface text-text shadow-sm"
                  : "text-muted hover:text-text",
              ].join(" ")}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
