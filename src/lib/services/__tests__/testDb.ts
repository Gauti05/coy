import { MongoMemoryServer } from "mongodb-memory-server";
import {
  IncomingLike,
  Match,
  Profile,
  Swipe,
} from "@/lib/models";

let memoryServer: MongoMemoryServer | null = null;

export async function startTestDatabase(): Promise<void> {
  memoryServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = memoryServer.getUri();

  const { resetDatabaseConnection, connectToDatabase } = await import(
    "@/lib/db"
  );
  await resetDatabaseConnection();
  await connectToDatabase({ syncIndexes: true });
}

export async function stopTestDatabase(): Promise<void> {
  const { resetDatabaseConnection } = await import("@/lib/db");
  await resetDatabaseConnection();

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

export async function clearCollections(): Promise<void> {
  await Promise.all([
    Profile.deleteMany({}),
    Swipe.deleteMany({}),
    Match.deleteMany({}),
    IncomingLike.deleteMany({}),
  ]);
}

export type FixtureProfiles = {
  likedMe: { id: string; name: string };
  notLikedMe: { id: string; name: string };
  extra: { id: string; name: string };
};

/** Small fixtures: A liked me, B and C did not. */
export async function seedFixtures(): Promise<FixtureProfiles> {
  const [likedMe, notLikedMe, extra] = await Profile.insertMany([
    {
      name: "Profile A",
      age: 22,
      photoUrl: "https://randomuser.me/api/portraits/women/90.jpg",
      bio: "Liked me already",
      location: "Test City",
      interests: ["music", "coffee"],
    },
    {
      name: "Profile B",
      age: 24,
      photoUrl: "https://randomuser.me/api/portraits/men/90.jpg",
      bio: "Did not like me",
      location: "Other City",
      interests: ["hiking", "film", "cooking"],
    },
    {
      name: "Profile C",
      age: 21,
      photoUrl: "https://randomuser.me/api/portraits/women/91.jpg",
      bio: "Extra profile",
      location: "Campus",
      interests: ["art", "tea"],
    },
  ]);

  await IncomingLike.create({ profileId: likedMe!._id });

  return {
    likedMe: { id: likedMe!._id.toString(), name: likedMe!.name },
    notLikedMe: { id: notLikedMe!._id.toString(), name: notLikedMe!.name },
    extra: { id: extra!._id.toString(), name: extra!.name },
  };
}
