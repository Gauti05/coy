import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const profileSchema = new Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true, min: 18 },
    photoUrl: { type: String, required: true },
    bio: { type: String, required: true },
    location: { type: String, required: true },
    interests: {
      type: [{ type: String }],
      required: true,
      validate: {
        validator: (value: string[]) => value.length >= 2 && value.length <= 4,
        message: "interests must contain 2–4 items",
      },
    },
  },
  { timestamps: false },
);

export type ProfileDocument = InferSchemaType<typeof profileSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Profile: Model<ProfileDocument> =
  (mongoose.models.Profile as Model<ProfileDocument> | undefined) ??
  mongoose.model<ProfileDocument>("Profile", profileSchema);
