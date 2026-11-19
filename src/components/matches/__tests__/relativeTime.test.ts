import { describe, expect, it } from "vitest";
import { formatMatchedRelative } from "../relativeTime";

describe("formatMatchedRelative", () => {
  it("formats recent matches with RelativeTimeFormat", () => {
    const now = Date.parse("2026-11-18T12:00:00.000Z");
    const threeMinutesAgo = "2026-11-18T11:57:00.000Z";

    expect(formatMatchedRelative(threeMinutesAgo, now)).toMatch(
      /Matched .*minute/i,
    );
  });

  it("handles just-now style values", () => {
    const now = Date.parse("2026-11-18T12:00:00.000Z");
    expect(formatMatchedRelative("2026-11-18T12:00:00.000Z", now)).toMatch(
      /^Matched /,
    );
  });
});
