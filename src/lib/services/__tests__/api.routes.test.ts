import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CURRENT_USER_ID } from "@/lib/constants";
import {
  clearCollections,
  seedFixtures,
  startTestDatabase,
  stopTestDatabase,
  type FixtureProfiles,
} from "./testDb";

vi.mock("next/server", async () => {
  const actual =
    await vi.importActual<typeof import("next/server")>("next/server");
  return {
    ...actual,
    connection: async () => undefined,
  };
});

describe("API route handlers", () => {
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

  it("POST /api/swipe returns 400 for an invalid body", async () => {
    const { POST } = await import("@/app/api/swipe/route");
    const response = await POST(
      new Request("http://localhost/api/swipe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetId: fixtures.extra.id }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid swipe payload",
    });
  });

  it("POST /api/swipe happy path returns matched true for a liked-me profile", async () => {
    const { POST } = await import("@/app/api/swipe/route");
    const response = await POST(
      new Request("http://localhost/api/swipe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          targetId: fixtures.likedMe.id,
          direction: "like",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body.matched).toBe(true);
    expect(body.profile.id).toBe(fixtures.likedMe.id);
    expect(body.profile).not.toHaveProperty("likedMe");

    const { GET } = await import("@/app/api/matches/route");
    const matchesResponse = await GET();
    expect(matchesResponse.status).toBe(200);
    expect(matchesResponse.headers.get("cache-control")).toBe("no-store");
    const matchesBody = await matchesResponse.json();
    expect(matchesBody.matches).toHaveLength(1);
    expect(matchesBody.matches[0].id).toBe(fixtures.likedMe.id);

    const { GET: getFeedRoute } = await import("@/app/api/feed/route");
    const feedResponse = await getFeedRoute();
    expect(feedResponse.status).toBe(200);
    expect(feedResponse.headers.get("cache-control")).toBe("no-store");
    const feedBody = await feedResponse.json();
    expect(
      feedBody.profiles.every(
        (profile: { id: string }) => profile.id !== fixtures.likedMe.id,
      ),
    ).toBe(true);
    expect(CURRENT_USER_ID).toBe("me");
  });

  it("non-match swipe responses are byte-identical across privacy paths", async () => {
    const { POST } = await import("@/app/api/swipe/route");

    const post = async (targetId: string, direction: "like" | "pass") =>
      POST(
        new Request("http://localhost/api/swipe", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ targetId, direction }),
        }),
      );

    const passLiked = await post(fixtures.likedMe.id, "pass");

    await clearCollections();
    fixtures = await seedFixtures();
    const likeNotLiked = await post(fixtures.notLikedMe.id, "like");

    await clearCollections();
    fixtures = await seedFixtures();
    const passNotLiked = await post(fixtures.extra.id, "pass");

    const bodies = await Promise.all([
      passLiked.text(),
      likeNotLiked.text(),
      passNotLiked.text(),
    ]);

    expect(passLiked.status).toBe(200);
    expect(likeNotLiked.status).toBe(200);
    expect(passNotLiked.status).toBe(200);
    expect(passLiked.headers.get("cache-control")).toBe("no-store");
    expect(likeNotLiked.headers.get("cache-control")).toBe("no-store");
    expect(passNotLiked.headers.get("cache-control")).toBe("no-store");
    expect(bodies[0]).toBe('{"matched":false}');
    expect(bodies[1]).toBe(bodies[0]);
    expect(bodies[2]).toBe(bodies[0]);
  });
});
