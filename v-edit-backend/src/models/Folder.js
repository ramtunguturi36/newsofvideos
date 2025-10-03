import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const folderSchema = new Schema(
  {
    name: { type: String, required: true },
    parentId: { type: Types.ObjectId, ref: 'Folder', default: null },
    description: { type: String },
    basePrice: { type: Number, default: 0 }, // 0 means not purchasable as a bundle
    discountPrice: { type: Number },
    isPurchasable: { type: Boolean, default: false }, // Admin can enable folder purchase
    thumbnailUrl: { type: String }, // Folder preview image
    previewVideoUrl: { type: String }, // Optional preview video for the folder
    totalTemplates: { type: Number, default: 0 }, // Auto-calculated
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Folder = model('Folder', folderSchema);

export default Folder;


