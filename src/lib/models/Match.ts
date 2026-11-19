import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const matchSchema = new Schema(
  {
    userA: { type: String, required: true },
    userB: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: false },
);

matchSchema.index({ userA: 1, userB: 1 }, { unique: true });

export type MatchDocument = InferSchemaType<typeof matchSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Match: Model<MatchDocument> =
  (mongoose.models.Match as Model<MatchDocument> | undefined) ??
  mongoose.model<MatchDocument>("Match", matchSchema);

/** Store match pairs with lexicographically sorted user ids. */
export function sortedMatchPair(
  userId1: string,
  userId2: string,
): { userA: string; userB: string } {
  return userId1 < userId2
    ? { userA: userId1, userB: userId2 }
    : { userA: userId2, userB: userId1 };
}
