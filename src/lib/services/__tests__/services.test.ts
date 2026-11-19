import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { CURRENT_USER_ID } from "@/lib/constants";
import {
  AlreadySwipedError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { IncomingLike, Match, Swipe, sortedMatchPair } from "@/lib/models";
import { getFeed } from "@/lib/services/feedService";
import { getMatches } from "@/lib/services/matchService";
import { PUBLIC_PROFILE_KEYS } from "@/lib/services/publicProfile";
import { swipe } from "@/lib/services/swipeService";
import {
  clearCollections,
  seedFixtures,
  startTestDatabase,
  stopTestDatabase,
  type FixtureProfiles,
} from "./testDb";

describe("Coy services", () => {
  let fixtures: FixtureProfiles;

  beforeAll(async () => {
    await startTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await clearCollections();
    fixtures = await seedFixtures();
  });

  it("excludes swiped profiles (like and pass) from the feed", async () => {
    await swipe(CURRENT_USER_ID, fixtures.likedMe.id, "like");
    await swipe(CURRENT_USER_ID, fixtures.notLikedMe.id, "pass");

    const feed = await getFeed(CURRENT_USER_ID);
    const ids = feed.map((profile) => profile.id);

    expect(ids).toEqual([fixtures.extra.id]);
    expect(ids).not.toContain(fixtures.likedMe.id);
    expect(ids).not.toContain(fixtures.notLikedMe.id);
  });

  it("returns only public profile fields in the feed", async () => {
    const feed = await getFeed(CURRENT_USER_ID);
    expect(feed.length).toBeGreaterThan(0);

    for (const profile of feed) {
      expect(Object.keys(profile).sort()).toEqual(
        [...PUBLIC_PROFILE_KEYS].sort(),
      );
      expect(profile).not.toHaveProperty("likedMe");
      expect(profile).not.toHaveProperty("incomingLike");
      expect(profile).not.toHaveProperty("liked");
      expect(profile).not.toHaveProperty("__v");
      expect(profile).not.toHaveProperty("_id");
    }
  });

  it("keeps feed order identical when IncomingLike contents change", async () => {
    const before = await getFeed(CURRENT_USER_ID);

    await IncomingLike.deleteMany({});
    await IncomingLike.create({ profileId: fixtures.notLikedMe.id });
    await IncomingLike.create({ profileId: fixtures.extra.id });

    const after = await getFeed(CURRENT_USER_ID);
    expect(after.map((profile) => profile.id)).toEqual(
      before.map((profile) => profile.id),
    );
  });

  it("rejects duplicate swipes via ConflictError and DB unique index", async () => {
    await swipe(CURRENT_USER_ID, fixtures.extra.id, "pass");
    await expect(
      swipe(CURRENT_USER_ID, fixtures.extra.id, "like"),
    ).rejects.toBeInstanceOf(AlreadySwipedError);
    await expect(
      swipe(CURRENT_USER_ID, fixtures.extra.id, "like"),
    ).rejects.toBeInstanceOf(ConflictError);

    await expect(
      Swipe.create({
        swiperId: CURRENT_USER_ID,
        targetId: fixtures.extra.id,
        direction: "like",
        createdAt: new Date(),
      }),
    ).rejects.toMatchObject({ code: 11000 });
  });

  it("creates a sorted Match when liking a profile that liked me", async () => {
    const result = await swipe(CURRENT_USER_ID, fixtures.likedMe.id, "like");

    expect(result).toEqual({
      matched: true,
      profile: expect.objectContaining({
        id: fixtures.likedMe.id,
        name: fixtures.likedMe.name,
      }),
    });

    if (result.matched) {
      expect(Object.keys(result.profile).sort()).toEqual(
        [...PUBLIC_PROFILE_KEYS].sort(),
      );
    }

    const pair = sortedMatchPair(CURRENT_USER_ID, fixtures.likedMe.id);
    const match = await Match.findOne(pair).lean();
    expect(match).not.toBeNull();
    expect(match!.userA < match!.userB).toBe(true);
  });

  it("returns exactly { matched: false } when liking someone who did not like me", async () => {
    const result = await swipe(CURRENT_USER_ID, fixtures.notLikedMe.id, "like");
    expect(result).toEqual({ matched: false });
    expect(await Match.countDocuments()).toBe(0);
  });

  it("returns { matched: false } and no Match when passing on someone who liked me", async () => {
    const result = await swipe(CURRENT_USER_ID, fixtures.likedMe.id, "pass");
    expect(result).toEqual({ matched: false });
    expect(await Match.countDocuments()).toBe(0);
    expect(await IncomingLike.countDocuments()).toBe(1);
  });

  it("makes non-match responses identical across privacy-sensitive paths", async () => {
    const passOnLikedMe = await swipe(
      CURRENT_USER_ID,
      fixtures.likedMe.id,
      "pass",
    );

    await clearCollections();
    fixtures = await seedFixtures();

    const likeOnNotLikedMe = await swipe(
      CURRENT_USER_ID,
      fixtures.notLikedMe.id,
      "like",
    );

    await clearCollections();
    fixtures = await seedFixtures();

    const passOnNotLikedMe = await swipe(
      CURRENT_USER_ID,
      fixtures.notLikedMe.id,
      "pass",
    );

    const expected = JSON.stringify({ matched: false });
    expect(JSON.stringify(passOnLikedMe)).toBe(expected);
    expect(JSON.stringify(likeOnNotLikedMe)).toBe(expected);
    expect(JSON.stringify(passOnNotLikedMe)).toBe(expected);
    expect(Object.keys(passOnLikedMe)).toEqual(["matched"]);
  });

  it("handles concurrent duplicate swipes on a liked-me profile", async () => {
    const results = await Promise.allSettled([
      swipe(CURRENT_USER_ID, fixtures.likedMe.id, "like"),
      swipe(CURRENT_USER_ID, fixtures.likedMe.id, "like"),
      swipe(CURRENT_USER_ID, fixtures.likedMe.id, "like"),
    ]);

    const fulfilled = results.filter((result) => result.status === "fulfilled");
    const rejected = results.filter((result) => result.status === "rejected");

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(2);
    expect(
      rejected.every(
        (result) =>
          result.status === "rejected" &&
          result.reason instanceof AlreadySwipedError,
      ),
    ).toBe(true);

    expect(await Swipe.countDocuments()).toBe(1);
    expect(await Match.countDocuments()).toBe(1);
  });

  it("validates self / invalid ObjectId / missing profile", async () => {
    await expect(
      swipe(fixtures.extra.id, fixtures.extra.id, "like"),
    ).rejects.toBeInstanceOf(ValidationError);

    await expect(
      swipe(CURRENT_USER_ID, "not-an-object-id", "like"),
    ).rejects.toBeInstanceOf(ValidationError);

    const missingId = new mongoose.Types.ObjectId().toString();
    await expect(
      swipe(CURRENT_USER_ID, missingId, "like"),
    ).rejects.toBeInstanceOf(NotFoundError);

    await expect(
      swipe(CURRENT_USER_ID, CURRENT_USER_ID, "like"),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("returns only mutual matches, newest first, with public fields", async () => {
    await swipe(CURRENT_USER_ID, fixtures.likedMe.id, "like");

    // Non-mutual like must not appear in matches.
    await swipe(CURRENT_USER_ID, fixtures.notLikedMe.id, "like");

    await new Promise((resolve) => setTimeout(resolve, 5));

    await IncomingLike.create({ profileId: fixtures.extra.id });
    await swipe(CURRENT_USER_ID, fixtures.extra.id, "like");

    const matches = await getMatches(CURRENT_USER_ID);
    expect(matches.map((match) => match.id)).toEqual([
      fixtures.extra.id,
      fixtures.likedMe.id,
    ]);

    for (const match of matches) {
      expect(Object.keys(match).sort()).toEqual(
        [...PUBLIC_PROFILE_KEYS, "matchedAt"].sort(),
      );
      expect(match.matchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(match).not.toHaveProperty("userA");
      expect(match).not.toHaveProperty("userB");
    }
  });
});
