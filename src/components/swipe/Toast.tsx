"use client";

type ToastProps = {
  message: string | null;
  /** Error toasts use role="alert"; informational use role="status". */
  variant?: "status" | "alert";
  onDismiss: () => void;
};

export function Toast({
  message,
  variant = "alert",
  onDismiss,
}: ToastProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      role={variant}
      aria-live={variant === "alert" ? "assertive" : "polite"}
      className="pointer-events-auto absolute inset-x-4 bottom-24 z-50 flex items-start gap-3 rounded-xl bg-text px-4 py-3 text-sm text-surface shadow-lg"
    >
      <p className="flex-1 leading-snug">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="min-h-[44px] min-w-[44px] shrink-0 rounded-lg text-sm font-medium text-surface/80 hover:text-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Dismiss"
      >
        Dismiss
      </button>
    </div>
  );
}
