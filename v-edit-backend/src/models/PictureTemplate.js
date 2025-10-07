import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const pictureTemplateSchema = new Schema(
  {
    folderId: { type: Types.ObjectId, ref: 'Folder', required: true },
    title: { type: String, required: true },
    description: { type: String },
    basePrice: { type: Number, required: true },
    discountPrice: { type: Number },
    discountedPrice: { type: Number }, // Keep for backward compatibility
    previewImageUrl: { type: String, required: true }, // Preview image (low quality/watermarked)
    downloadImageUrl: { type: String, required: true }, // High quality downloadable image
    category: { type: String, enum: ['photography', 'graphics', 'illustrations', 'templates', 'other'], default: 'other' },
    tags: [{ type: String }], // For search and filtering
    dimensions: { 
      width: { type: Number },
      height: { type: Number }
    },
    fileSize: { type: Number }, // File size in bytes
    format: { type: String, enum: ['jpg', 'jpeg', 'png', 'gif', 'webp'], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const PictureTemplate = model('PictureTemplate', pictureTemplateSchema);

export default PictureTemplate;
