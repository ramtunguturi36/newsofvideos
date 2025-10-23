import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";
import AudioFolder from "../models/AudioFolder.js";
import AudioContent from "../models/AudioContent.js";
import { uploadToR2 } from "../utils/r2.js";
import {
  addAudioWatermark,
  noWatermark,
  getAudioMetadata,
} from "../utils/audioWatermark.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1000 * 1000 * 50 },
}); // 50MB limit

const router = express.Router();

// Create audio folder
router.post(
  "/audio-folders",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { name, parentId, description, category } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });
      const folder = await AudioFolder.create({
        name,
        parentId: parentId || null,
        description,
        category: category || "other",
        createdBy: req.user.userId,
      });
      return res.json({ folder });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// Upload audio content
router.post(
  "/audio-content",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        description,
        basePrice,
        discountPrice,
        parentId,
        category,
        artist,
        album,
      } = req.body;
      if (!title || !basePrice)
        return res.status(400).json({ message: "Missing fields" });
      const audioFile = req.files?.audio?.[0];
      const thumbnailFile = req.files?.thumbnail?.[0];
      if (!audioFile)
        return res.status(400).json({ message: "Audio file is required" });

      const folderId = parentId || null;
      const bucket = process.env.R2_BUCKET;
      const ts = Date.now();

      console.log("🎵 Processing audio upload...");

      // Get audio metadata
      const metadata = await getAudioMetadata(audioFile.buffer);
      console.log("📊 Audio metadata:", metadata);

      // Try to add watermark to preview audio (optional - will return original if watermarking fails)
      console.log("💧 Attempting to add watermark to preview audio...");
      const watermarkedAudio = await noWatermark(audioFile.buffer);
      // Alternative: Use addAudioWatermark if voice watermark is desired
      // const watermarkedAudio = await addAudioWatermark(audioFile.buffer, 'This is a preview')

      const audioKey = `audio-downloads/${ts}-${audioFile.originalname}`;
      const previewKey = `audio-previews/${ts}-preview-${audioFile.originalname}`;

      const uploadPromises = [
        uploadToR2({
          bucket,
          key: audioKey,
          contentType: audioFile.mimetype,
          body: audioFile.buffer,
        }),
        uploadToR2({
          bucket,
          key: previewKey,
          contentType: audioFile.mimetype,
          body: watermarkedAudio,
        }),
      ];

      let thumbnailUrl = null;
      if (thumbnailFile) {
        const thumbnailKey = `audio-thumbnails/${ts}-${thumbnailFile.originalname}`;
        uploadPromises.push(
          uploadToR2({
            bucket,
            key: thumbnailKey,
            contentType: thumbnailFile.mimetype,
            body: thumbnailFile.buffer,
          }),
        );
      }

      const results = await Promise.all(uploadPromises);
      const downloadAudioUrl = results[0];
      const previewAudioUrl = results[1];
      if (thumbnailFile) {
        thumbnailUrl = results[2];
      }

      const audioContent = await AudioContent.create({
        folderId,
        title,
        description,
        basePrice: Number(basePrice),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        previewAudioUrl,
        downloadAudioUrl,
        thumbnailUrl,
        category: category || "other",
        fileSize: audioFile.size,
        format: audioFile.originalname.split(".").pop().toLowerCase(),
        duration: metadata.duration,
        bitrate: metadata.bitrate,
        sampleRate: metadata.sampleRate,
        artist: artist || undefined,
        album: album || undefined,
      });

      console.log("✅ Audio content created successfully");
      return res.json({ audio: audioContent });
    } catch (err) {
      console.error("❌ Audio upload error:", err);
      return res.status(500).json({
        message: "Server error",
        error: err.message,
        details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
    }
  },
);

// Test endpoint to check all audio content
router.get("/test-audio-content", async (req, res) => {
  try {
    const allAudio = await AudioContent.find({}).sort({ createdAt: -1 });
    console.log("🧪 Test endpoint - All audio content:", allAudio.length);
    return res.json({ count: allAudio.length, audio: allAudio });
  } catch (err) {
    console.error("Test endpoint error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get audio hierarchy
router.get("/audio-hierarchy", async (req, res) => {
  try {
    const { folderId } = req.query;
    const filter = { parentId: folderId || null };
    const [folders, rawAudio, path] = await Promise.all([
      AudioFolder.find(filter).sort({ createdAt: 1 }),
      AudioContent.find(folderId ? { folderId } : {}).sort({ createdAt: 1 }),
      buildAudioPath(folderId),
    ]);

    // Fix audio to handle both discountPrice and discountedPrice fields
    const audio = rawAudio.map((item) => {
      const audioObj = item.toObject();
      if (audioObj.discountedPrice && !audioObj.discountPrice) {
        audioObj.discountPrice = audioObj.discountedPrice;
      }
      delete audioObj.discountedPrice;
      return audioObj;
    });

    return res.json({ folders, audio, path });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get single audio content
router.get("/audio-content/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const audio = await AudioContent.findById(id);
    if (!audio) return res.status(404).json({ message: "Audio not found" });
    return res.json({ audio });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Update audio folder
router.put(
  "/audio-folders/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        parentId,
        description,
        category,
        basePrice,
        discountPrice,
        isPurchasable,
        thumbnailUrl,
        previewAudioUrl,
      } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });

      const updateData = {
        name,
        parentId: parentId || null,
        description,
        category,
      };

      // Add pricing fields if provided
      if (basePrice !== undefined) updateData.basePrice = Number(basePrice);
      if (discountPrice !== undefined)
        updateData.discountPrice = Number(discountPrice);
      if (isPurchasable !== undefined)
        updateData.isPurchasable = Boolean(isPurchasable);
      if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
      if (previewAudioUrl !== undefined)
        updateData.previewAudioUrl = previewAudioUrl;

      const folder = await AudioFolder.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      if (!folder) return res.status(404).json({ message: "Folder not found" });

      return res.json({ folder });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// Upload cover photo for audio folder
router.post(
  "/audio-folders/:id/cover-photo",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.single("coverPhoto"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const coverPhotoFile = req.file;

      if (!coverPhotoFile) {
        return res
          .status(400)
          .json({ message: "Cover photo file is required" });
      }

      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/webp",
      ];
      if (!validImageTypes.includes(coverPhotoFile.mimetype)) {
        return res
          .status(400)
          .json({
            message: "Invalid file type. Please upload a valid image file.",
          });
      }

      const folder = await AudioFolder.findById(id);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }

      const bucket = process.env.R2_BUCKET;
      const ts = Date.now();
      const coverPhotoKey = `audio-folder-covers/${ts}-${coverPhotoFile.originalname}`;

      const coverPhotoUrl = await uploadToR2({
        bucket,
        key: coverPhotoKey,
        contentType: coverPhotoFile.mimetype,
        body: coverPhotoFile.buffer,
      });

      const updatedFolder = await AudioFolder.findByIdAndUpdate(
        id,
        { coverPhotoUrl },
        { new: true },
      );

      return res.json({
        success: true,
        folder: updatedFolder,
        message: "Cover photo uploaded successfully",
      });
    } catch (err) {
      console.error("Cover photo upload error:", err);
      return res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    }
  },
);

// Delete audio folder
router.delete(
  "/audio-folders/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid folder ID format" });
      }

      const folder = await AudioFolder.findById(id);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }

      // CASCADE DELETE: Delete all child folders recursively
      async function deleteChildFolders(folderId) {
        const children = await AudioFolder.find({ parentId: folderId });
        for (const child of children) {
          await deleteChildFolders(child._id); // Recursive delete
          await AudioFolder.findByIdAndDelete(child._id);
        }
      }

      await deleteChildFolders(id);

      // CASCADE DELETE: Delete all audio in this folder
      await AudioContent.deleteMany({ folderId: id });

      // Delete the folder itself
      await AudioFolder.findByIdAndDelete(id);

      return res.json({
        message: "Folder and all its contents deleted successfully",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// Update audio content
router.put(
  "/audio-content/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        basePrice,
        discountPrice,
        folderId,
        category,
        artist,
        album,
      } = req.body;

      const audio = await AudioContent.findById(id);
      if (!audio) return res.status(404).json({ message: "Audio not found" });

      const updateData = {
        title: title || audio.title,
        description:
          description !== undefined ? description : audio.description,
        basePrice: basePrice ? Number(basePrice) : audio.basePrice,
        discountPrice: discountPrice
          ? Number(discountPrice)
          : audio.discountPrice,
        folderId: folderId !== undefined ? folderId || null : audio.folderId,
        category: category || audio.category,
        artist: artist !== undefined ? artist : audio.artist,
        album: album !== undefined ? album : audio.album,
      };

      const audioFile = req.files?.audio?.[0];
      const thumbnailFile = req.files?.thumbnail?.[0];

      if (audioFile || thumbnailFile) {
        const bucket = process.env.R2_BUCKET;
        const ts = Date.now();

        if (audioFile) {
          console.log("🎵 Processing audio update...");

          const metadata = await getAudioMetadata(audioFile.buffer);
          const watermarkedAudio = await noWatermark(audioFile.buffer);

          const audioKey = `audio-downloads/${ts}-${audioFile.originalname}`;
          const previewKey = `audio-previews/${ts}-preview-${audioFile.originalname}`;

          const [downloadUrl, previewUrl] = await Promise.all([
            uploadToR2({
              bucket,
              key: audioKey,
              contentType: audioFile.mimetype,
              body: audioFile.buffer,
            }),
            uploadToR2({
              bucket,
              key: previewKey,
              contentType: audioFile.mimetype,
              body: watermarkedAudio,
            }),
          ]);

          updateData.downloadAudioUrl = downloadUrl;
          updateData.previewAudioUrl = previewUrl;
          updateData.fileSize = audioFile.size;
          updateData.format = audioFile.originalname
            .split(".")
            .pop()
            .toLowerCase();
          updateData.duration = metadata.duration;
          updateData.bitrate = metadata.bitrate;
          updateData.sampleRate = metadata.sampleRate;
        }

        if (thumbnailFile) {
          const thumbnailKey = `audio-thumbnails/${ts}-${thumbnailFile.originalname}`;
          updateData.thumbnailUrl = await uploadToR2({
            bucket,
            key: thumbnailKey,
            contentType: thumbnailFile.mimetype,
            body: thumbnailFile.buffer,
          });
        }
      }

      const updatedAudio = await AudioContent.findByIdAndUpdate(
        id,
        updateData,
        { new: true },
      );
      return res.json({ audio: updatedAudio });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// Delete audio content
router.delete(
  "/audio-content/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const audio = await AudioContent.findByIdAndDelete(id);
      if (!audio) return res.status(404).json({ message: "Audio not found" });

      return res.json({ message: "Audio deleted successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// Move audio content to different folder
router.patch(
  "/audio-content/:id/move",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { folderId } = req.body;

      const audio = await AudioContent.findByIdAndUpdate(
        id,
        { folderId: folderId || null },
        { new: true },
      );
      if (!audio) return res.status(404).json({ message: "Audio not found" });

      return res.json({ audio });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// Move audio folder to different parent
router.patch(
  "/audio-folders/:id/move",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { parentId } = req.body;

      if (parentId) {
        const isDescendant = await checkIfDescendant(parentId, id);
        if (isDescendant || parentId === id) {
          return res
            .status(400)
            .json({
              message: "Cannot move folder into itself or its descendants",
            });
        }
      }

      const folder = await AudioFolder.findByIdAndUpdate(
        id,
        { parentId: parentId || null },
        { new: true },
      );
      if (!folder) return res.status(404).json({ message: "Folder not found" });

      return res.json({ folder });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// Helper function to check if folder is descendant
async function checkIfDescendant(potentialParent, folderId) {
  let current = await AudioFolder.findById(potentialParent);
  while (current) {
    if (current._id.toString() === folderId) return true;
    current = current.parentId
      ? await AudioFolder.findById(current.parentId)
      : null;
  }
  return false;
}

// Helper function to build audio folder path
async function buildAudioPath(folderId) {
  if (!folderId) return [];
  const path = [];
  let current = await AudioFolder.findById(folderId);
  while (current) {
    path.unshift({ _id: current._id, name: current.name });
    current = current.parentId
      ? await AudioFolder.findById(current.parentId)
      : null;
  }
  return path;
}

export default router;
