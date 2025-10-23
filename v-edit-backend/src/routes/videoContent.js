import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";
import VideoFolder from "../models/VideoFolder.js";
import VideoContent from "../models/VideoContent.js";
import { uploadToR2 } from "../utils/r2.js";
import {
  addVideoWatermark,
  getVideoMetadata,
} from "../utils/videoWatermark.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1000 * 1000 * 500 },
}); // 500MB limit

const router = express.Router();

// Create video folder
router.post(
  "/video-folders",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { name, parentId, description, category } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });
      const folder = await VideoFolder.create({
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

// Upload video content
router.post(
  "/video-content",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.fields([
    { name: "video", maxCount: 1 },
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
      } = req.body;
      if (!title || !basePrice)
        return res.status(400).json({ message: "Missing fields" });
      const videoFile = req.files?.video?.[0];
      const thumbnailFile = req.files?.thumbnail?.[0];
      if (!videoFile)
        return res.status(400).json({ message: "Video file is required" });

      const folderId = parentId || null;
      const bucket = process.env.R2_BUCKET;
      const ts = Date.now();

      console.log("🎬 Processing video upload...");

      // Get video metadata
      const metadata = await getVideoMetadata(videoFile.buffer);
      console.log("📊 Video metadata:", metadata);

      // TEMPORARY FIX: Watermarking disabled to prevent Render crashes
      // Using original video as preview until Cloudflare Workers implementation
      console.log(
        "⚠️  WATERMARKING DISABLED - Using original video as preview",
      );
      const watermarkedVideo = videoFile.buffer; // No processing, no crash

      const videoKey = `video-downloads/${ts}-${videoFile.originalname}`;
      const previewKey = `video-previews/${ts}-preview-${videoFile.originalname}`;

      const uploadPromises = [
        uploadToR2({
          bucket,
          key: videoKey,
          contentType: videoFile.mimetype,
          body: videoFile.buffer,
        }),
        uploadToR2({
          bucket,
          key: previewKey,
          contentType: videoFile.mimetype,
          body: watermarkedVideo,
        }),
      ];

      let thumbnailUrl = null;
      if (thumbnailFile) {
        const thumbnailKey = `video-thumbnails/${ts}-${thumbnailFile.originalname}`;
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
      const downloadVideoUrl = results[0];
      const previewVideoUrl = results[1];
      if (thumbnailFile) {
        thumbnailUrl = results[2];
      }

      const videoContent = await VideoContent.create({
        folderId,
        title,
        description,
        basePrice: Number(basePrice),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        previewVideoUrl,
        downloadVideoUrl,
        thumbnailUrl,
        category: category || "other",
        fileSize: videoFile.size,
        format: videoFile.originalname.split(".").pop().toLowerCase(),
        duration: metadata.duration,
        resolution: {
          width: metadata.width,
          height: metadata.height,
        },
        fps: metadata.fps,
      });

      console.log("✅ Video content created successfully");
      return res.json({ video: videoContent });
    } catch (err) {
      console.error("❌ Video upload error:", err);
      return res.status(500).json({
        message: "Server error",
        error: err.message,
        details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
    }
  },
);

// Test endpoint to check all video content
router.get("/test-video-content", async (req, res) => {
  try {
    const allVideos = await VideoContent.find({}).sort({ createdAt: -1 });
    console.log("🧪 Test endpoint - All video content:", allVideos.length);
    return res.json({ count: allVideos.length, videos: allVideos });
  } catch (err) {
    console.error("Test endpoint error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get video hierarchy
router.get("/video-hierarchy", async (req, res) => {
  try {
    const { folderId } = req.query;
    const filter = { parentId: folderId || null };
    const [folders, rawVideos, path] = await Promise.all([
      VideoFolder.find(filter).sort({ createdAt: 1 }),
      VideoContent.find(folderId ? { folderId } : {}).sort({ createdAt: 1 }),
      buildVideoPath(folderId),
    ]);

    // Fix videos to handle both discountPrice and discountedPrice fields
    const videos = rawVideos.map((video) => {
      const videoObj = video.toObject();
      if (videoObj.discountedPrice && !videoObj.discountPrice) {
        videoObj.discountPrice = videoObj.discountedPrice;
      }
      delete videoObj.discountedPrice;
      return videoObj;
    });

    return res.json({ folders, videos, path });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get single video content
router.get("/video-content/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const video = await VideoContent.findById(id);
    if (!video) return res.status(404).json({ message: "Video not found" });
    return res.json({ video });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Update video folder
router.put(
  "/video-folders/:id",
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
        previewVideoUrl,
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
      if (previewVideoUrl !== undefined)
        updateData.previewVideoUrl = previewVideoUrl;

      const folder = await VideoFolder.findByIdAndUpdate(id, updateData, {
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

// Upload cover photo for video folder
router.post(
  "/video-folders/:id/cover-photo",
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
        return res.status(400).json({
          message: "Invalid file type. Please upload a valid image file.",
        });
      }

      const folder = await VideoFolder.findById(id);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }

      const bucket = process.env.R2_BUCKET;
      const ts = Date.now();
      const coverPhotoKey = `video-folder-covers/${ts}-${coverPhotoFile.originalname}`;

      const coverPhotoUrl = await uploadToR2({
        bucket,
        key: coverPhotoKey,
        contentType: coverPhotoFile.mimetype,
        body: coverPhotoFile.buffer,
      });

      const updatedFolder = await VideoFolder.findByIdAndUpdate(
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

// Delete video folder
router.delete(
  "/video-folders/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid folder ID format" });
      }

      const folder = await VideoFolder.findById(id);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }

      // CASCADE DELETE: Delete all child folders recursively
      async function deleteChildFolders(folderId) {
        const children = await VideoFolder.find({ parentId: folderId });
        for (const child of children) {
          await deleteChildFolders(child._id); // Recursive delete
          await VideoFolder.findByIdAndDelete(child._id);
        }
      }

      await deleteChildFolders(id);

      // CASCADE DELETE: Delete all videos in this folder
      await VideoContent.deleteMany({ folderId: id });

      // Delete the folder itself
      await VideoFolder.findByIdAndDelete(id);

      return res.json({
        message: "Folder and all its contents deleted successfully",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// Update video content
router.put(
  "/video-content/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.fields([
    { name: "video", maxCount: 1 },
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
      } = req.body;

      const video = await VideoContent.findById(id);
      if (!video) return res.status(404).json({ message: "Video not found" });

      const updateData = {
        title: title || video.title,
        description:
          description !== undefined ? description : video.description,
        basePrice: basePrice ? Number(basePrice) : video.basePrice,
        discountPrice: discountPrice
          ? Number(discountPrice)
          : video.discountPrice,
        folderId: folderId !== undefined ? folderId || null : video.folderId,
        category: category || video.category,
      };

      const videoFile = req.files?.video?.[0];
      const thumbnailFile = req.files?.thumbnail?.[0];

      if (videoFile || thumbnailFile) {
        const bucket = process.env.R2_BUCKET;
        const ts = Date.now();

        if (videoFile) {
          console.log("🎬 Processing video update...");

          const metadata = await getVideoMetadata(videoFile.buffer);
          // TEMPORARY FIX: Watermarking disabled to prevent Render crashes
          console.log(
            "⚠️  WATERMARKING DISABLED - Using original video as preview",
          );
          const watermarkedVideo = videoFile.buffer; // No processing, no crash

          const videoKey = `video-downloads/${ts}-${videoFile.originalname}`;
          const previewKey = `video-previews/${ts}-preview-${videoFile.originalname}`;

          const [downloadUrl, previewUrl] = await Promise.all([
            uploadToR2({
              bucket,
              key: videoKey,
              contentType: videoFile.mimetype,
              body: videoFile.buffer,
            }),
            uploadToR2({
              bucket,
              key: previewKey,
              contentType: videoFile.mimetype,
              body: watermarkedVideo,
            }),
          ]);

          updateData.downloadVideoUrl = downloadUrl;
          updateData.previewVideoUrl = previewUrl;
          updateData.fileSize = videoFile.size;
          updateData.format = videoFile.originalname
            .split(".")
            .pop()
            .toLowerCase();
          updateData.duration = metadata.duration;
          updateData.resolution = {
            width: metadata.width,
            height: metadata.height,
          };
          updateData.fps = metadata.fps;
        }

        if (thumbnailFile) {
          const thumbnailKey = `video-thumbnails/${ts}-${thumbnailFile.originalname}`;
          updateData.thumbnailUrl = await uploadToR2({
            bucket,
            key: thumbnailKey,
            contentType: thumbnailFile.mimetype,
            body: thumbnailFile.buffer,
          });
        }
      }

      const updatedVideo = await VideoContent.findByIdAndUpdate(
        id,
        updateData,
        { new: true },
      );
      return res.json({ video: updatedVideo });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// Delete video content
router.delete(
  "/video-content/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const video = await VideoContent.findByIdAndDelete(id);
      if (!video) return res.status(404).json({ message: "Video not found" });

      return res.json({ message: "Video deleted successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// Move video content to different folder
router.patch(
  "/video-content/:id/move",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { folderId } = req.body;

      const video = await VideoContent.findByIdAndUpdate(
        id,
        { folderId: folderId || null },
        { new: true },
      );
      if (!video) return res.status(404).json({ message: "Video not found" });

      return res.json({ video });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// Move video folder to different parent
router.patch(
  "/video-folders/:id/move",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { parentId } = req.body;

      if (parentId) {
        const isDescendant = await checkIfDescendant(parentId, id);
        if (isDescendant || parentId === id) {
          return res.status(400).json({
            message: "Cannot move folder into itself or its descendants",
          });
        }
      }

      const folder = await VideoFolder.findByIdAndUpdate(
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
  let current = await VideoFolder.findById(potentialParent);
  while (current) {
    if (current._id.toString() === folderId) return true;
    current = current.parentId
      ? await VideoFolder.findById(current.parentId)
      : null;
  }
  return false;
}

// Helper function to build video folder path
async function buildVideoPath(folderId) {
  if (!folderId) return [];
  const path = [];
  let current = await VideoFolder.findById(folderId);
  while (current) {
    path.unshift({ _id: current._id, name: current.name });
    current = current.parentId
      ? await VideoFolder.findById(current.parentId)
      : null;
  }
  return path;
}

export default router;
