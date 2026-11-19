export function SwipeSkeleton() {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl bg-background"
      aria-hidden
    >
      <div className="absolute inset-0 animate-pulse bg-border/70" />
      <div className="absolute inset-x-0 bottom-0 space-y-3 p-5">
        <div className="h-7 w-2/3 animate-pulse rounded-md bg-surface/80" />
        <div className="h-4 w-1/3 animate-pulse rounded-md bg-surface/70" />
        <div className="h-10 w-full animate-pulse rounded-md bg-surface/60" />
        <div className="flex gap-2">
          <div className="h-7 w-16 animate-pulse rounded-full bg-surface/70" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-surface/70" />
        </div>
      </div>
    </div>
  );
}
