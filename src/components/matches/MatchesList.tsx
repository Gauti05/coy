"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { fetchMatches, type MatchListItem } from "@/lib/api-client";
import { formatMatchedRelative } from "./relativeTime";

type LoadState = "loading" | "ready" | "error";

export function MatchesList() {
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoadState("loading");

    try {
      const next = await fetchMatches(signal);
      if (signal?.aborted) {
        return;
      }
      setMatches(next);
      setLoadState("ready");
    } catch (error) {
      if (signal?.aborted) {
        return;
      }
      console.error(error);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void load(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [load]);

  if (loadState === "loading") {
    return (
      <div className="h-full min-h-0 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3" aria-hidden>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-border bg-background"
            >
              <div className="aspect-[3/4] animate-pulse bg-border/70" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-2/3 animate-pulse rounded bg-border/80" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-border/70" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-background px-6 text-center">
        <p className="text-sm text-muted">
          Couldn&apos;t load matches. Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-background px-6 text-center">
        <h2 className="text-lg font-semibold text-text">No matches yet</h2>
        <p className="text-sm text-muted">
          Keep swiping, mutual likes show up here.
        </p>
        <Link
          href="/discover"
          className="mt-1 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Back to swipe
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <ul className="grid grid-cols-2 gap-3 pb-2">
        {matches.map((match) => (
          <li
            key={match.id}
            className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
          >
            <div className="relative aspect-[3/4] bg-background">
              <ProfilePhoto
                name={match.name}
                photoUrl={match.photoUrl}
                sizes="(max-width: 448px) 45vw, 200px"
                className="object-cover object-top"
                fallbackClassName="text-xl"
              />
            </div>
            <div className="space-y-1 p-3">
              <p className="truncate text-sm font-semibold text-text">
                {match.name}, {match.age}
              </p>
              <p className="flex items-center gap-1 truncate text-xs text-muted">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">{match.location}</span>
              </p>
              <p className="text-xs text-muted">
                {formatMatchedRelative(match.matchedAt)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
