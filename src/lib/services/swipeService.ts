import mongoose from "mongoose";
import {
  AlreadySwipedError,
  isDuplicateKeyError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import {
  IncomingLike,
  Match,
  Profile,
  sortedMatchPair,
  Swipe,
} from "@/lib/models";
import { toPublicProfile, type PublicProfile } from "./publicProfile";

export type SwipeDirection = "like" | "pass";

/** Canonical non-match body — identical object shape/key order for all non-match paths. */
export const NO_MATCH_RESULT = { matched: false } as const;

export type SwipeResult =
  | typeof NO_MATCH_RESULT
  | { matched: true; profile: PublicProfile };

export async function swipe(
  userId: string,
  targetId: string,
  direction: SwipeDirection,
): Promise<SwipeResult> {
  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    throw new ValidationError("Invalid targetId");
  }

  if (targetId === userId) {
    throw new ValidationError("Cannot swipe on yourself");
  }

  const profile = await Profile.findById(targetId)
    .select({ name: 1, age: 1, photoUrl: 1, bio: 1, location: 1, interests: 1 })
    .lean();

  if (!profile) {
    throw new NotFoundError("Profile not found");
  }

  try {
    await Swipe.create({
      swiperId: userId,
      targetId,
      direction,
      createdAt: new Date(),
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AlreadySwipedError();
    }
    throw error;
  }

  // Pass never reads IncomingLike (same work whether or not they liked "me").
  if (direction !== "like") {
    return NO_MATCH_RESULT;
  }

  // Every like performs the same IncomingLike lookup (timing not a trivial oracle
  // for whether IncomingLike existed — the lookup always runs on like).
  const incoming = await IncomingLike.findOne({ profileId: targetId })
    .select({ _id: 1 })
    .lean();

  if (!incoming) {
    return NO_MATCH_RESULT;
  }

  const pair = sortedMatchPair(userId, targetId);
  try {
    await Match.create({
      ...pair,
      createdAt: new Date(),
    });
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error;
    }
  }

  return {
    matched: true,
    profile: toPublicProfile(profile),
  };
}
