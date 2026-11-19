"use client";

import { Heart, X } from "lucide-react";

type SwipeButtonsProps = {
  disabled?: boolean;
  onPass: () => void;
  onLike: () => void;
};

export function SwipeButtons({ disabled, onPass, onLike }: SwipeButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-6 py-3">
      <button
        type="button"
        aria-label="Pass"
        disabled={disabled}
        onClick={onPass}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface text-danger shadow-sm transition enabled:hover:bg-danger/5 enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2"
      >
        <X className="h-7 w-7" strokeWidth={2.5} aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Like"
        disabled={disabled}
        onClick={onLike}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface text-success shadow-sm transition enabled:hover:bg-success/5 enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2"
      >
        <Heart className="h-7 w-7" strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
}
