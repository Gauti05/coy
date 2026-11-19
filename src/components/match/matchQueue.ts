import type { PublicProfile } from "@/lib/api-client";

export type MatchQueueAction =
  | { type: "enqueue"; profile: PublicProfile }
  | { type: "dismiss" };

/** FIFO match overlay queue; dedupes by profile id. */
export function matchQueueReducer(
  state: PublicProfile[],
  action: MatchQueueAction,
): PublicProfile[] {
  switch (action.type) {
    case "enqueue":
      if (state.some((profile) => profile.id === action.profile.id)) {
        return state;
      }
      return [...state, action.profile];
    case "dismiss":
      return state.slice(1);
    default:
      return state;
  }
}
