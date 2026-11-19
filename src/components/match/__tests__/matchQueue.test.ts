import { describe, expect, it } from "vitest";
import type { PublicProfile } from "@/lib/api-client";
import { matchQueueReducer } from "../matchQueue";

const profile = (id: string, name = id): PublicProfile => ({
  id,
  name,
  age: 22,
  photoUrl: `https://randomuser.me/api/portraits/women/80.jpg`,
  bio: "bio",
  location: "Test",
  interests: ["a", "b"],
});

describe("matchQueueReducer", () => {
  it("enqueues FIFO and dedupes by id", () => {
    let state = matchQueueReducer([], {
      type: "enqueue",
      profile: profile("a", "A"),
    });
    state = matchQueueReducer(state, {
      type: "enqueue",
      profile: profile("b", "B"),
    });
    state = matchQueueReducer(state, {
      type: "enqueue",
      profile: profile("a", "A again"),
    });

    expect(state.map((item) => item.id)).toEqual(["a", "b"]);
  });

  it("dismisses the front item only", () => {
    let state = [
      profile("a"),
      profile("b"),
      profile("c"),
    ];
    state = matchQueueReducer(state, { type: "dismiss" });
    expect(state.map((item) => item.id)).toEqual(["b", "c"]);
    state = matchQueueReducer(state, { type: "dismiss" });
    expect(state.map((item) => item.id)).toEqual(["c"]);
    state = matchQueueReducer(state, { type: "dismiss" });
    expect(state).toEqual([]);
  });
});
