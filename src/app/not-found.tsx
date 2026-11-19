import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold text-text">Page not found</h1>
      <p className="text-sm text-muted">That route does not exist in Coy.</p>
      <Link
        href="/discover"
        className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        Go to Discover
      </Link>
    </div>
  );
}
