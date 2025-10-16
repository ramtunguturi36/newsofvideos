import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const pictureFolderSchema = new Schema(
  {
    name: { type: String, required: true },
    parentId: { type: Types.ObjectId, ref: 'PictureFolder', default: null },
    description: { type: String },
    basePrice: { type: Number, default: 0 }, // 0 means not purchasable as a bundle
    discountPrice: { type: Number },
    isPurchasable: { type: Boolean, default: false }, // Admin can enable folder purchase
    thumbnailUrl: { type: String }, // Folder preview image
    previewImageUrl: { type: String }, // Optional preview image for the folder
    coverPhotoUrl: { type: String }, // Cover photo for the folder
    totalPictures: { type: Number, default: 0 }, // Auto-calculated
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    category: { type: String, enum: ['photography', 'graphics', 'illustrations', 'templates', 'other'], default: 'other' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const PictureFolder = model('PictureFolder', pictureFolderSchema);

export default PictureFolder;
