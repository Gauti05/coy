import type { PublicProfile } from "@/lib/services/publicProfile";

export type { PublicProfile };

export type SwipeDirection = "like" | "pass";

export type FeedResponse = {
  profiles: PublicProfile[];
};

export type SwipeResponse =
  | { matched: false }
  | { matched: true; profile: PublicProfile };

export class ApiClientError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

export async function fetchFeed(signal?: AbortSignal): Promise<PublicProfile[]> {
  const response = await fetch("/api/feed", {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new ApiClientError("Failed to load feed", response.status);
  }

  const data = (await response.json()) as FeedResponse;
  return data.profiles;
}

export type MatchListItem = PublicProfile & {
  matchedAt: string;
};

export type MatchesResponse = {
  matches: MatchListItem[];
};

export async function fetchMatches(
  signal?: AbortSignal,
): Promise<MatchListItem[]> {
  const response = await fetch("/api/matches", {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new ApiClientError("Failed to load matches", response.status);
  }

  const data = (await response.json()) as MatchesResponse;
  return data.matches;
}

export async function postSwipe(
  targetId: string,
  direction: SwipeDirection,
  signal?: AbortSignal,
): Promise<{ status: number; body: SwipeResponse }> {
  const response = await fetch("/api/swipe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ targetId, direction }),
    signal,
  });

  if (response.status === 409) {
    return { status: 409, body: { matched: false } };
  }

  if (!response.ok) {
    throw new ApiClientError("Failed to save swipe", response.status);
  }

  const body = (await response.json()) as SwipeResponse;
  return { status: response.status, body };
}
