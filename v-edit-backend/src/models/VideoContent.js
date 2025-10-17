import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const videoContentSchema = new Schema(
  {
    folderId: { type: Types.ObjectId, ref: 'VideoFolder', required: true },
    title: { type: String, required: true },
    description: { type: String },
    basePrice: { type: Number, required: true },
    discountPrice: { type: Number },
    previewVideoUrl: { type: String, required: true }, // Watermarked preview video
    downloadVideoUrl: { type: String, required: true }, // Original high quality video
    thumbnailUrl: { type: String }, // Video thumbnail/poster image
    category: {
      type: String,
      enum: ['animations', 'tutorials', 'music-videos', 'commercials', 'documentaries', 'other'],
      default: 'other'
    },
    tags: [{ type: String }], // For search and filtering
    duration: { type: Number }, // Duration in seconds
    resolution: {
      width: { type: Number },
      height: { type: Number }
    },
    fileSize: { type: Number }, // File size in bytes
    format: { type: String, enum: ['mp4', 'mov', 'avi', 'webm', 'mkv'], required: true },
    fps: { type: Number }, // Frames per second
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const VideoContent = model('VideoContent', videoContentSchema);

export default VideoContent;
