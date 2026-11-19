import Link from "next/link";
import { HeartHandshake, Sparkles } from "lucide-react";

export function SwipeEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-background px-6 text-center">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary">
        <HeartHandshake className="h-10 w-10" aria-hidden />
        <Sparkles
          className="absolute -right-1 -top-1 h-5 w-5 text-primary"
          aria-hidden
        />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-text">You&apos;re all caught up</h2>
        <p className="text-sm text-muted">
          Check back later for more people, or see who you already matched with.
        </p>
      </div>
      <Link
        href="/discover/matches"
        className="mt-2 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-surface transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        View your matches
      </Link>
    </div>
  );
}
