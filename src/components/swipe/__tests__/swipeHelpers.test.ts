import { describe, expect, it } from "vitest";
import type { PublicProfile } from "@/lib/api-client";
import {
  deckQueueReducer,
  exitXForDirection,
  shouldCommitSwipe,
  SWIPE_OFFSET_THRESHOLD,
  SWIPE_VELOCITY_THRESHOLD,
} from "../swipeHelpers";

const profile = (id: string): PublicProfile => ({
  id,
  name: id,
  age: 22,
  photoUrl: `https://randomuser.me/api/portraits/men/80.jpg`,
  bio: "bio",
  location: "Test",
  interests: ["a", "b"],
});

describe("shouldCommitSwipe", () => {
  it("commits like from offset or velocity", () => {
    expect(shouldCommitSwipe(SWIPE_OFFSET_THRESHOLD + 1, 0)).toBe("like");
    expect(shouldCommitSwipe(10, SWIPE_VELOCITY_THRESHOLD + 1)).toBe("like");
  });

  it("commits pass from offset or velocity", () => {
    expect(shouldCommitSwipe(-(SWIPE_OFFSET_THRESHOLD + 1), 0)).toBe("pass");
    expect(shouldCommitSwipe(-10, -(SWIPE_VELOCITY_THRESHOLD + 1))).toBe(
      "pass",
    );
  });

  it("returns null when under both thresholds", () => {
    expect(shouldCommitSwipe(20, 40)).toBeNull();
  });
});

describe("deckQueueReducer", () => {
  it("replaces, removes, and unshifts without duplicating", () => {
    const a = profile("a");
    const b = profile("b");
    const c = profile("c");

    let state = deckQueueReducer([], { type: "replace", profiles: [a, b, c] });
    expect(state.map((item) => item.id)).toEqual(["a", "b", "c"]);

    state = deckQueueReducer(state, { type: "removeFront" });
    expect(state.map((item) => item.id)).toEqual(["b", "c"]);

    state = deckQueueReducer(state, { type: "removeById", id: "c" });
    expect(state.map((item) => item.id)).toEqual(["b"]);

    state = deckQueueReducer(state, { type: "unshift", profile: a });
    expect(state.map((item) => item.id)).toEqual(["a", "b"]);

    state = deckQueueReducer(state, { type: "unshift", profile: a });
    expect(state.map((item) => item.id)).toEqual(["a", "b"]);
  });
});

describe("exitXForDirection", () => {
  it("returns signed off-screen distances", () => {
    expect(exitXForDirection("like", 400)).toBeGreaterThan(0);
    expect(exitXForDirection("pass", 400)).toBeLessThan(0);
  });
});
