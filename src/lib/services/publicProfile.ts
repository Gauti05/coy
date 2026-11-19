import type { ProfileDocument } from "@/lib/models";

export type PublicProfile = {
  id: string;
  name: string;
  age: number;
  photoUrl: string;
  bio: string;
  location: string;
  interests: string[];
};

export const PUBLIC_PROFILE_KEYS = [
  "id",
  "name",
  "age",
  "photoUrl",
  "bio",
  "location",
  "interests",
] as const;

type ProfileLike = Pick<
  ProfileDocument,
  "name" | "age" | "photoUrl" | "bio" | "location" | "interests"
> & { _id: { toString(): string } };

export function toPublicProfile(profile: ProfileLike): PublicProfile {
  return {
    id: profile._id.toString(),
    name: profile.name,
    age: profile.age,
    photoUrl: profile.photoUrl,
    bio: profile.bio,
    location: profile.location,
    interests: [...profile.interests],
  };
}
