import type { PublicProfile } from "@/lib/api-client";

export const SWIPE_OFFSET_THRESHOLD = 120;
export const SWIPE_VELOCITY_THRESHOLD = 650;

export type SwipeCommit = "like" | "pass";

/** Decide whether a drag should commit, and in which direction. */
export function shouldCommitSwipe(
  offsetX: number,
  velocityX: number,
): SwipeCommit | null {
  if (
    offsetX > SWIPE_OFFSET_THRESHOLD ||
    velocityX > SWIPE_VELOCITY_THRESHOLD
  ) {
    return "like";
  }

  if (
    offsetX < -SWIPE_OFFSET_THRESHOLD ||
    velocityX < -SWIPE_VELOCITY_THRESHOLD
  ) {
    return "pass";
  }

  return null;
}

export type DeckQueueAction =
  | { type: "replace"; profiles: PublicProfile[] }
  | { type: "removeFront" }
  | { type: "removeById"; id: string }
  | { type: "unshift"; profile: PublicProfile };

export function deckQueueReducer(
  state: PublicProfile[],
  action: DeckQueueAction,
): PublicProfile[] {
  switch (action.type) {
    case "replace":
      return action.profiles;
    case "removeFront":
      return state.slice(1);
    case "removeById":
      return state.filter((profile) => profile.id !== action.id);
    case "unshift":
      if (state.some((profile) => profile.id === action.profile.id)) {
        return state;
      }
      return [action.profile, ...state];
    default:
      return state;
  }
}

export function exitXForDirection(
  direction: SwipeCommit,
  width = typeof window !== "undefined" ? window.innerWidth : 400,
): number {
  return direction === "like" ? width * 1.25 : -width * 1.25;
}
