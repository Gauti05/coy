import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Server-side only: profiles that already liked "me".
 * Never select this collection into API/client responses.
 */
const incomingLikeSchema = new Schema(
  {
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
  },
  { timestamps: false },
);

incomingLikeSchema.index({ profileId: 1 }, { unique: true });

export type IncomingLikeDocument = InferSchemaType<typeof incomingLikeSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const IncomingLike: Model<IncomingLikeDocument> =
  (mongoose.models.IncomingLike as Model<IncomingLikeDocument> | undefined) ??
  mongoose.model<IncomingLikeDocument>("IncomingLike", incomingLikeSchema);
