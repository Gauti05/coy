import { connectToDatabase } from "@/lib/db";
import {
  IncomingLike,
  Match,
  Profile,
  Swipe,
} from "@/lib/models";
import { INCOMING_LIKE_INDICES, SEED_PROFILES } from "@/lib/seed-data";

export type SeedResult = {
  profiles: number;
  incomingLikes: number;
  swipes: number;
  matches: number;
};

async function insertSeedData(): Promise<SeedResult> {
  const profileDocs = await Profile.insertMany(
    SEED_PROFILES.map((profile) => ({
      name: profile.name,
      age: profile.age,
      bio: profile.bio,
      location: profile.location,
      interests: profile.interests,
      photoUrl: profile.photoUrl,
    })),
  );

  const incomingLikes = INCOMING_LIKE_INDICES.map((index) => ({
    profileId: profileDocs[index]!._id,
  }));

  await IncomingLike.insertMany(incomingLikes);

  return {
    profiles: profileDocs.length,
    incomingLikes: incomingLikes.length,
    swipes: 0,
    matches: 0,
  };
}

/**
 * Clear all demo collections and reseed profiles + IncomingLike.
 * Shared by `npm run seed` and `npm run reset`.
 */
export async function reseedDatabase(): Promise<SeedResult> {
  await connectToDatabase({ syncIndexes: true });

  await Promise.all([
    Profile.deleteMany({}),
    Swipe.deleteMany({}),
    Match.deleteMany({}),
    IncomingLike.deleteMany({}),
  ]);

  return insertSeedData();
}

/**
 * Seed only when the Profile collection is empty.
 * Called from GET /api/feed in Phase 2.
 */
export async function ensureSeeded(): Promise<boolean> {
  await connectToDatabase({ syncIndexes: true });

  const count = await Profile.countDocuments();
  if (count > 0) {
    return false;
  }

  await insertSeedData();
  return true;
}

export async function getCollectionCounts(): Promise<SeedResult> {
  const [profiles, incomingLikes, swipes, matches] = await Promise.all([
    Profile.countDocuments(),
    IncomingLike.countDocuments(),
    Swipe.countDocuments(),
    Match.countDocuments(),
  ]);

  return { profiles, incomingLikes, swipes, matches };
}
