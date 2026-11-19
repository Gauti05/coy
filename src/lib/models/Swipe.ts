import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const swipeSchema = new Schema(
  {
    swiperId: { type: String, required: true },
    targetId: { type: String, required: true },
    direction: {
      type: String,
      enum: ["like", "pass"] as const,
      required: true,
    },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: false },
);

swipeSchema.index({ swiperId: 1, targetId: 1 }, { unique: true });

export type SwipeDocument = InferSchemaType<typeof swipeSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Swipe: Model<SwipeDocument> =
  (mongoose.models.Swipe as Model<SwipeDocument> | undefined) ??
  mongoose.model<SwipeDocument>("Swipe", swipeSchema);
