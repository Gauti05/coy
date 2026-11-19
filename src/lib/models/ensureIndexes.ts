import { IncomingLike } from "./IncomingLike";
import { Match } from "./Match";
import { Profile } from "./Profile";
import { Swipe } from "./Swipe";

/** Build / sync all model indexes (seed + test connection path). */
export async function ensureIndexes(): Promise<void> {
  await Promise.all([
    Profile.syncIndexes(),
    Swipe.syncIndexes(),
    Match.syncIndexes(),
    IncomingLike.syncIndexes(),
  ]);
}
