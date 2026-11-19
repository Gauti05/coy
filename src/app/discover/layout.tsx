import { DiscoverSegmentedControl } from "@/components/DiscoverSegmentedControl";

export default function DiscoverLayout({
  children,
}: LayoutProps<"/discover">) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <DiscoverSegmentedControl />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-2 pt-3">
        {children}
      </div>
    </div>
  );
}
