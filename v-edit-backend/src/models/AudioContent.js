import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const audioContentSchema = new Schema(
  {
    folderId: { type: Types.ObjectId, ref: 'AudioFolder', required: true },
    title: { type: String, required: true },
    description: { type: String },
    basePrice: { type: Number, required: true },
    discountPrice: { type: Number },
    previewAudioUrl: { type: String, required: true }, // Preview audio (with watermark if possible)
    downloadAudioUrl: { type: String, required: true }, // Original high quality audio
    thumbnailUrl: { type: String }, // Audio cover art/thumbnail image
    category: {
      type: String,
      enum: ['audiobooks', 'music', 'podcasts', 'sound-effects', 'ambient', 'other'],
      default: 'other'
    },
    tags: [{ type: String }], // For search and filtering
    duration: { type: Number }, // Duration in seconds
    fileSize: { type: Number }, // File size in bytes
    format: { type: String, enum: ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'], required: true },
    bitrate: { type: Number }, // Audio bitrate in kbps
    sampleRate: { type: Number }, // Sample rate in Hz (e.g., 44100, 48000)
    artist: { type: String }, // Artist/creator name
    album: { type: String }, // Album name (if applicable)
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const AudioContent = model('AudioContent', audioContentSchema);

export default AudioContent;
