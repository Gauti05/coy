"use client";

import { useEffect, useId, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { PublicProfile } from "@/lib/api-client";
import { Confetti } from "./Confetti";
import { MatchAvatars } from "./MatchAvatars";

type MatchOverlayProps = {
  profile: PublicProfile;
  onDismiss: () => void;
};

export function MatchOverlay({ profile, onDismiss }: MatchOverlayProps) {
  const router = useRouter();
  const headingId = useId();
  const primaryRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    primaryRef.current?.focus();

    const inertTargets = document.querySelectorAll<HTMLElement>("[data-app-inert]");
    inertTargets.forEach((el) => {
      el.setAttribute("inert", "");
    });

    return () => {
      inertTargets.forEach((el) => {
        el.removeAttribute("inert");
      });
      previouslyFocused.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-[60] flex justify-center">
      <div className="relative h-full w-full max-w-md">
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-black/55"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0.15 : 0.25 }}
        />

        {!reducedMotion ? <Confetti active /> : null}

        <div className="relative flex h-full items-center justify-center p-6">
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-xl"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={
              reducedMotion
                ? { duration: 0.15 }
                : { type: "spring", stiffness: 280, damping: 22 }
            }
          >
            <motion.h2
              id={headingId}
              className="text-center text-3xl font-bold tracking-tight text-text"
              initial={
                reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.7 }
              }
              animate={{ opacity: 1, scale: 1 }}
              transition={
                reducedMotion
                  ? { duration: 0.15 }
                  : { type: "spring", stiffness: 320, damping: 16, delay: 0.05 }
              }
            >
              It&apos;s a match!
            </motion.h2>

            <p className="mt-2 text-center text-sm text-muted">
              You and {profile.name} liked each other.
            </p>

            <div className="mt-8">
              <MatchAvatars profile={profile} reducedMotion={reducedMotion} />
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                ref={primaryRef}
                type="button"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-surface transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                onClick={() => {
                  onDismiss();
                  router.push("/discover/matches");
                }}
              >
                View matches
              </button>
              <button
                type="button"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                onClick={onDismiss}
              >
                Keep swiping
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
