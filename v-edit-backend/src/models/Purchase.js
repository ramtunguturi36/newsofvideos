import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const itemSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "template",
        "folder",
        "picture-template",
        "picture-folder",
        "video-content",
        "video-folder",
        "audio-content",
        "audio-folder",
      ],
      required: true,
    },
    templateId: { type: Types.ObjectId, ref: "Template" },
    folderId: { type: Types.ObjectId, ref: "Folder" },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    qrUrl: { type: String },
    videoUrl: { type: String },
    previewImageUrl: { type: String }, // For picture templates
    downloadImageUrl: { type: String }, // For picture templates
    previewVideoUrl: { type: String }, // For video content
    downloadVideoUrl: { type: String }, // For video content
    previewAudioUrl: { type: String }, // For audio content
    downloadAudioUrl: { type: String }, // For audio content
    thumbnailUrl: { type: String }, // For video/audio thumbnails
  },
  { _id: false },
);

const purchaseSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    items: { type: [itemSchema], default: [] },
    totalAmount: { type: Number, required: true },
    discountApplied: { type: Number, default: 0 },
    paymentId: { type: String },
    orderId: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const Purchase = model("Purchase", purchaseSchema);

export default Purchase;
