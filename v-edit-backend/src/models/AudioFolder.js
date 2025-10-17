import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const audioFolderSchema = new Schema(
  {
    name: { type: String, required: true },
    parentId: { type: Types.ObjectId, ref: 'AudioFolder', default: null },
    description: { type: String },
    basePrice: { type: Number, default: 0 }, // 0 means not purchasable as a bundle
    discountPrice: { type: Number },
    isPurchasable: { type: Boolean, default: false }, // Admin can enable folder purchase
    thumbnailUrl: { type: String }, // Folder preview image
    previewAudioUrl: { type: String }, // Optional preview audio for the folder
    coverPhotoUrl: { type: String }, // Cover photo for the folder
    totalAudio: { type: Number, default: 0 }, // Auto-calculated
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: ['audiobooks', 'music', 'podcasts', 'sound-effects', 'ambient', 'other'],
      default: 'other'
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const AudioFolder = model('AudioFolder', audioFolderSchema);

export default AudioFolder;
