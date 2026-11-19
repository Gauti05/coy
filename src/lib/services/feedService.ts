import mongoose from "mongoose";
import { Profile, Swipe } from "@/lib/models";
import { toPublicProfile, type PublicProfile } from "./publicProfile";

export async function getFeed(userId: string): Promise<PublicProfile[]> {
  const swipes = await Swipe.find({ swiperId: userId }).select({ targetId: 1 }).lean();
  const swipedIds = swipes.map((swipe) => swipe.targetId);

  const profiles = await Profile.find({
    _id: {
      $nin: swipedIds.map((id) => new mongoose.Types.ObjectId(id)),
    },
  })
    .sort({ _id: 1 })
    .select({ name: 1, age: 1, photoUrl: 1, bio: 1, location: 1, interests: 1 })
    .lean();

  return profiles.map((profile) => toPublicProfile(profile));
}
