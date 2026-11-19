import mongoose from "mongoose";
import { Match, Profile } from "@/lib/models";
import { toPublicProfile, type PublicProfile } from "./publicProfile";

export type MatchResult = PublicProfile & {
  matchedAt: string;
};

export async function getMatches(userId: string): Promise<MatchResult[]> {
  const matches = await Match.find({
    $or: [{ userA: userId }, { userB: userId }],
  })
    .sort({ createdAt: -1 })
    .lean();

  if (matches.length === 0) {
    return [];
  }

  const otherIds = matches.map((match) =>
    match.userA === userId ? match.userB : match.userA,
  );

  const profiles = await Profile.find({
    _id: {
      $in: otherIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id)),
    },
  })
    .select({ name: 1, age: 1, photoUrl: 1, bio: 1, location: 1, interests: 1 })
    .lean();

  const profilesById = new Map(
    profiles.map((profile) => [profile._id.toString(), profile]),
  );

  const results: MatchResult[] = [];
  for (const match of matches) {
    const otherId = match.userA === userId ? match.userB : match.userA;
    const profile = profilesById.get(otherId);
    if (!profile) {
      continue;
    }

    results.push({
      ...toPublicProfile(profile),
      matchedAt: new Date(match.createdAt).toISOString(),
    });
  }

  return results;
}
