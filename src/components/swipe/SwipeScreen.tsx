"use client";

import { useCallback, useReducer } from "react";
import type { PublicProfile } from "@/lib/api-client";
import { MatchOverlay } from "@/components/match/MatchOverlay";
import { matchQueueReducer } from "@/components/match/matchQueue";
import { SwipeDeck } from "./SwipeDeck";

export function SwipeScreen() {
  const [matchQueue, dispatchMatch] = useReducer(matchQueueReducer, []);
  const activeMatch = matchQueue[0] ?? null;

  const handleMatch = useCallback((profile: PublicProfile) => {
    dispatchMatch({ type: "enqueue", profile });
  }, []);

  const dismissMatch = useCallback(() => {
    dispatchMatch({ type: "dismiss" });
  }, []);

  return (
    <>
      <SwipeDeck onMatch={handleMatch} paused={Boolean(activeMatch)} />
      {activeMatch ? (
        <MatchOverlay profile={activeMatch} onDismiss={dismissMatch} />
      ) : null}
    </>
  );
}
