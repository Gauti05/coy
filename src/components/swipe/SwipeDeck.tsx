"use client";

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { animate, useMotionValue, type PanInfo } from "framer-motion";
import {
  fetchFeed,
  postSwipe,
  type PublicProfile,
} from "@/lib/api-client";
import { SwipeButtons } from "./SwipeButtons";
import { SwipeCard } from "./SwipeCard";
import { SwipeEmptyState } from "./SwipeEmptyState";
import { SwipeSkeleton } from "./SwipeSkeleton";
import { Toast } from "./Toast";
import {
  deckQueueReducer,
  exitXForDirection,
  shouldCommitSwipe,
  type SwipeCommit,
} from "./swipeHelpers";

type LoadState = "loading" | "ready" | "error";

type ExitingCard = {
  profile: PublicProfile;
  direction: SwipeCommit;
};

export type SwipeDeckProps = {
  onMatch: (profile: PublicProfile) => void;
  /** When true, ignore new drag/button/keyboard input; in-flight swipes still finish. */
  paused?: boolean;
};

export function SwipeDeck({ onMatch, paused = false }: SwipeDeckProps) {
  const [queue, dispatchQueue] = useReducer(deckQueueReducer, []);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [toast, setToast] = useState<string | null>(null);
  const [exiting, setExiting] = useState<ExitingCard | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const swipedIdsRef = useRef(new Set<string>());
  const isAnimatingRef = useRef(false);
  const exitTokenRef = useRef(0);
  const onMatchRef = useRef(onMatch);
  const pausedRef = useRef(paused);
  const dragX = useMotionValue(0);

  useEffect(() => {
    onMatchRef.current = onMatch;
  }, [onMatch]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const top = queue[0] ?? null;
  const next = queue[1] ?? null;
  const frontProfile = exiting?.profile ?? top;
  const behindProfile = exiting ? top : next;

  const loadFeed = useCallback(async (signal?: AbortSignal) => {
    setLoadState("loading");
    setToast(null);

    try {
      const profiles = await fetchFeed(signal);
      if (signal?.aborted) {
        return;
      }

      const filtered = profiles.filter(
        (profile) => !swipedIdsRef.current.has(profile.id),
      );
      dispatchQueue({ type: "replace", profiles: filtered });
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
    // Defer so the effect stays a subscription/setup boundary for the linter.
    const timer = window.setTimeout(() => {
      void loadFeed(controller.signal);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [loadFeed]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const preloadUrl = behindProfile?.photoUrl ?? next?.photoUrl;
    if (!preloadUrl) {
      return;
    }
    const image = new window.Image();
    image.src = preloadUrl;
  }, [behindProfile?.photoUrl, next?.photoUrl]);

  const clearExit = useCallback(() => {
    setExiting(null);
    dragX.set(0);
    isAnimatingRef.current = false;
  }, [dragX]);

  const commitSwipe = useCallback(
    (direction: SwipeCommit) => {
      const profile = top;
      if (
        !profile ||
        isAnimatingRef.current ||
        exiting ||
        pausedRef.current
      ) {
        return;
      }

      const token = ++exitTokenRef.current;
      isAnimatingRef.current = true;
      swipedIdsRef.current.add(profile.id);
      setExiting({ profile, direction });
      dispatchQueue({ type: "removeFront" });

      void (async () => {
        try {
          if (reducedMotion) {
            await animate(dragX, 0, { duration: 0.15 });
          } else {
            await animate(dragX, exitXForDirection(direction), {
              type: "tween",
              duration: 0.28,
              ease: "easeOut",
            });
          }
        } finally {
          if (token === exitTokenRef.current) {
            clearExit();
          }
        }
      })();

      void (async () => {
        try {
          const { status, body } = await postSwipe(profile.id, direction);

          if (status === 409) {
            return;
          }

          if (body.matched) {
            onMatchRef.current(body.profile);
          }
        } catch {
          if (token === exitTokenRef.current) {
            exitTokenRef.current += 1;
          }
          swipedIdsRef.current.delete(profile.id);
          dispatchQueue({ type: "unshift", profile });
          setToast("Couldn't save that swipe. Try again.");
          clearExit();
        }
      })();
    },
    [clearExit, dragX, exiting, reducedMotion, top],
  );

  const handleDragEnd = useCallback(
    (info: PanInfo) => {
      if (isAnimatingRef.current || exiting || pausedRef.current) {
        return;
      }

      const commit = shouldCommitSwipe(info.offset.x, info.velocity.x);
      if (commit) {
        commitSwipe(commit);
        return;
      }

      void animate(dragX, 0, { type: "spring", stiffness: 420, damping: 34 });
    },
    [commitSwipe, dragX, exiting],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.repeat ||
        isAnimatingRef.current ||
        !top ||
        exiting ||
        pausedRef.current
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        commitSwipe("pass");
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        commitSwipe("like");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commitSwipe, exiting, top]);

  const buttonsDisabled =
    loadState !== "ready" || !top || Boolean(exiting) || paused;
  const showDeck = loadState === "ready" && Boolean(frontProfile);

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div className="relative aspect-[3/4] w-full max-h-full max-w-sm">
          {loadState === "loading" ? <SwipeSkeleton /> : null}

          {loadState === "error" ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-background px-6 text-center">
              <p className="text-sm text-muted">
                Couldn&apos;t load profiles. Check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => void loadFeed()}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Retry
              </button>
            </div>
          ) : null}

          {loadState === "ready" && !frontProfile ? <SwipeEmptyState /> : null}

          {showDeck && behindProfile ? (
            <SwipeCard
              key={`behind-${behindProfile.id}`}
              profile={behindProfile}
              isTop={false}
              dragX={dragX}
              reducedMotion={reducedMotion}
            />
          ) : null}

          {showDeck && frontProfile ? (
            <div
              className={
                reducedMotion && exiting
                  ? "absolute inset-0 opacity-0 transition-opacity duration-150"
                  : "absolute inset-0"
              }
            >
              <SwipeCard
                key={`front-${frontProfile.id}`}
                profile={frontProfile}
                isTop
                dragX={dragX}
                disabled={Boolean(exiting) || paused}
                reducedMotion={reducedMotion}
                forcedStamp={exiting?.direction ?? null}
                onDragEnd={handleDragEnd}
              />
            </div>
          ) : null}
        </div>
      </div>

      <SwipeButtons
        disabled={buttonsDisabled}
        onPass={() => commitSwipe("pass")}
        onLike={() => commitSwipe("like")}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
