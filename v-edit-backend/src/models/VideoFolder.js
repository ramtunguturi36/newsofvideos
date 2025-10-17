import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const videoFolderSchema = new Schema(
  {
    name: { type: String, required: true },
    parentId: { type: Types.ObjectId, ref: "VideoFolder", default: null },
    description: { type: String },
    basePrice: { type: Number, default: 0 }, // 0 means not purchasable as a bundle
    discountPrice: { type: Number },
    isPurchasable: { type: Boolean, default: false }, // Admin can enable folder purchase
    thumbnailUrl: { type: String }, // Folder preview image
    previewVideoUrl: { type: String }, // Optional preview video for the folder
    coverPhotoUrl: { type: String }, // Cover photo for the folder
    totalVideos: { type: Number, default: 0 }, // Auto-calculated
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      enum: [
        "animations",
        "tutorials",
        "music-videos",
        "commercials",
        "documentaries",
        "other",
      ],
      default: "other",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const VideoFolder = model("VideoFolder", videoFolderSchema);

export default VideoFolder;
