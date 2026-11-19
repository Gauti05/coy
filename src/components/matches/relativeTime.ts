const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

/** Format an ISO timestamp as "Matched 3 minutes ago" (etc.). */
export function formatMatchedRelative(
  matchedAt: string,
  now: number = Date.now(),
): string {
  const deltaSeconds = Math.round(
    (new Date(matchedAt).getTime() - now) / 1000,
  );

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  let duration = deltaSeconds;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return `Matched ${rtf.format(Math.round(duration), division.unit)}`;
    }
    duration /= division.amount;
  }

  return `Matched ${rtf.format(Math.round(duration), "year")}`;
}
