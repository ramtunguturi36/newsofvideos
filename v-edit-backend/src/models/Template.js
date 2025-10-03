import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const templateSchema = new Schema(
  {
    folderId: { type: Types.ObjectId, ref: 'Folder', required: true },
    title: { type: String, required: true },
    description: { type: String },
    basePrice: { type: Number, required: true },
    discountPrice: { type: Number },
    discountedPrice: { type: Number }, // Keep for backward compatibility
    videoUrl: { type: String, required: true },
    qrUrl: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Template = model('Template', templateSchema);

export default Template;


