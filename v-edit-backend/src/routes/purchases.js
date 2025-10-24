import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import Purchase from "../models/Purchase.js";
import archiver from "archiver";
import axios from "axios";
import Folder from "../models/Folder.js";
import Template from "../models/Template.js";
import PictureFolder from "../models/PictureFolder.js";
import PictureTemplate from "../models/PictureTemplate.js";
import VideoFolder from "../models/VideoFolder.js";
import VideoContent from "../models/VideoContent.js";
import AudioFolder from "../models/AudioFolder.js";
import AudioContent from "../models/AudioContent.js";

const router = express.Router();

// Get all purchases for the user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const purchases = await Purchase.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    return res.json({ purchases });
  } catch (err) {
    console.error("Error fetching purchases:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get video template purchases (folders and individual items)
router.get("/video-templates", authMiddleware, async (req, res) => {
  try {
    const purchases = await Purchase.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });

    const folders = [];
    const items = [];

    purchases.forEach((purchase) => {
      purchase.items.forEach((item) => {
        if (item.type === "folder") {
          folders.push({
            ...item.toObject(),
            purchaseDate: purchase.createdAt,
            purchaseId: purchase._id,
          });
        } else if (item.type === "template") {
          items.push({
            ...item.toObject(),
            purchaseDate: purchase.createdAt,
            purchaseId: purchase._id,
          });
        }
      });
    });

    return res.json({ folders, items });
  } catch (err) {
    console.error("Error fetching video template purchases:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get picture purchases (folders and individual items)
router.get("/pictures", authMiddleware, async (req, res) => {
  try {
    const purchases = await Purchase.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });

    const folders = [];
    const items = [];

    purchases.forEach((purchase) => {
      purchase.items.forEach((item) => {
        if (item.type === "picture-folder") {
          folders.push({
            ...item.toObject(),
            purchaseDate: purchase.createdAt,
            purchaseId: purchase._id,
          });
        } else if (item.type === "picture-template") {
          items.push({
            ...item.toObject(),
            purchaseDate: purchase.createdAt,
            purchaseId: purchase._id,
          });
        }
      });
    });

    return res.json({ folders, items });
  } catch (err) {
    console.error("Error fetching picture purchases:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get video content purchases (folders and individual items)
router.get("/video-content", authMiddleware, async (req, res) => {
  try {
    const purchases = await Purchase.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });

    const folders = [];
    const items = [];

    purchases.forEach((purchase) => {
      purchase.items.forEach((item) => {
        if (item.type === "video-folder") {
          folders.push({
            ...item.toObject(),
            purchaseDate: purchase.createdAt,
            purchaseId: purchase._id,
          });
        } else if (item.type === "video-content") {
          items.push({
            ...item.toObject(),
            purchaseDate: purchase.createdAt,
            purchaseId: purchase._id,
          });
        }
      });
    });

    return res.json({ folders, items });
  } catch (err) {
    console.error("Error fetching video content purchases:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get audio content purchases (folders and individual items)
router.get("/audio-content", authMiddleware, async (req, res) => {
  try {
    const purchases = await Purchase.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });

    const folders = [];
    const items = [];

    purchases.forEach((purchase) => {
      purchase.items.forEach((item) => {
        if (item.type === "audio-folder") {
          folders.push({
            ...item.toObject(),
            purchaseDate: purchase.createdAt,
            purchaseId: purchase._id,
          });
        } else if (item.type === "audio-content") {
          items.push({
            ...item.toObject(),
            purchaseDate: purchase.createdAt,
            purchaseId: purchase._id,
          });
        }
      });
    });

    return res.json({ folders, items });
  } catch (err) {
    console.error("Error fetching audio content purchases:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get a specific purchase
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const purchase = await Purchase.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    return res.json({ purchase });
  } catch (err) {
    console.error("Error fetching purchase:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Download folder contents as ZIP
router.get(
  "/download-folder-zip/:folderId",
  authMiddleware,
  async (req, res) => {
    const startTime = Date.now();
    try {
      const { folderId } = req.params;
      const { type } = req.query; // folder type: 'video', 'picture', 'video-content', 'audio'

      console.log(
        `[ZIP DOWNLOAD] Starting - Folder: ${folderId}, Type: ${type}`,
      );

      let folder = null;
      let items = [];
      let folderName = "folder";

      // Fetch folder and its contents based on type
      if (type === "video" || type === "folder") {
        folder = await Folder.findById(folderId);
        if (!folder) {
          console.error(`[ZIP DOWNLOAD] Folder not found: ${folderId}`);
          return res.status(404).json({ message: "Folder not found" });
        }
        folderName = folder.name;
        items = await Template.find({ folderId: folderId });
      } else if (type === "picture" || type === "picture-folder") {
        folder = await PictureFolder.findById(folderId);
        if (!folder) {
          console.error(`[ZIP DOWNLOAD] Picture folder not found: ${folderId}`);
          return res.status(404).json({ message: "Folder not found" });
        }
        folderName = folder.name;
        items = await PictureTemplate.find({ folderId: folderId });
      } else if (type === "video-content" || type === "video-folder") {
        folder = await VideoFolder.findById(folderId);
        if (!folder) {
          console.error(`[ZIP DOWNLOAD] Video folder not found: ${folderId}`);
          return res.status(404).json({ message: "Folder not found" });
        }
        folderName = folder.name;
        items = await VideoContent.find({ folderId: folderId });
      } else if (type === "audio" || type === "audio-folder") {
        folder = await AudioFolder.findById(folderId);
        if (!folder) {
          console.error(`[ZIP DOWNLOAD] Audio folder not found: ${folderId}`);
          return res.status(404).json({ message: "Folder not found" });
        }
        folderName = folder.name;
        items = await AudioContent.find({ folderId: folderId });
      } else {
        console.error(`[ZIP DOWNLOAD] Invalid folder type: ${type}`);
        return res.status(400).json({ message: "Invalid folder type" });
      }

      if (items.length === 0) {
        console.error(`[ZIP DOWNLOAD] No items found in folder: ${folderId}`);
        return res.status(404).json({ message: "No items found in folder" });
      }

      console.log(
        `[ZIP DOWNLOAD] Found ${items.length} items in folder "${folderName}"`,
      );

      // Set response headers for ZIP download
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${folderName.replace(/[^a-zA-Z0-9]/g, "-")}.zip"`,
      );

      // Disable timeout for this response
      res.setTimeout(300000); // 5 minutes

      // Create ZIP archive
      const archive = archiver("zip", {
        zlib: { level: 6 }, // Balanced compression (faster than level 9)
      });

      // Error handling for archive
      archive.on("error", (err) => {
        console.error(`[ZIP DOWNLOAD] Archive error:`, err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Failed to create ZIP file" });
        }
      });

      archive.on("warning", (err) => {
        if (err.code === "ENOENT") {
          console.warn(`[ZIP DOWNLOAD] Archive warning:`, err);
        } else {
          console.error(`[ZIP DOWNLOAD] Archive error:`, err);
          throw err;
        }
      });

      // Pipe archive to response
      archive.pipe(res);

      let successCount = 0;
      let failCount = 0;

      // Add each item to the ZIP
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemNumber = i + 1;

        try {
          let downloadUrl = null;
          let fileExt = "file";

          // Determine download URL and extension based on item type
          if (type === "video" || type === "folder") {
            downloadUrl = item.videoUrl;
            fileExt = "mp4";
          } else if (type === "picture" || type === "picture-folder") {
            downloadUrl = item.downloadImageUrl;
            fileExt = downloadUrl?.includes(".png") ? "png" : "jpg";
          } else if (type === "video-content" || type === "video-folder") {
            downloadUrl = item.downloadVideoUrl;
            fileExt = "mp4";
          } else if (type === "audio" || type === "audio-folder") {
            downloadUrl = item.downloadAudioUrl;
            fileExt = downloadUrl?.includes(".mp3")
              ? "mp3"
              : downloadUrl?.includes(".wav")
                ? "wav"
                : "audio";
          }

          if (downloadUrl) {
            console.log(
              `[ZIP DOWNLOAD] Fetching ${itemNumber}/${items.length}: ${item.title}`,
            );

            // Fetch file from R2 with timeout
            const response = await axios.get(downloadUrl, {
              responseType: "stream",
              timeout: 60000, // 60 seconds per file
            });

            // Add to archive with cleaned filename
            const filename = `${itemNumber}-${item.title.replace(/[^a-zA-Z0-9]/g, "-")}.${fileExt}`;
            archive.append(response.data, { name: filename });

            console.log(`[ZIP DOWNLOAD] ✓ Added: ${filename}`);
            successCount++;
          } else {
            console.warn(`[ZIP DOWNLOAD] No download URL for: ${item.title}`);
            failCount++;
          }
        } catch (error) {
          console.error(
            `[ZIP DOWNLOAD] ✗ Failed to add "${item.title}":`,
            error.message,
          );
          failCount++;
          // Continue with other files even if one fails
        }
      }

      // Finalize the archive
      await archive.finalize();

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(
        `[ZIP DOWNLOAD] ✓ Complete - Folder: "${folderName}", ` +
          `Files: ${successCount}/${items.length} successful, ` +
          `${failCount} failed, Duration: ${duration}s`,
      );
    } catch (err) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.error(`[ZIP DOWNLOAD] ✗ Error after ${duration}s:`, err);
      if (!res.headersSent) {
        return res.status(500).json({
          message: "Failed to create ZIP file",
          error: err.message,
        });
      }
    }
  },
);

// Get folder contents (for viewing purchased folder items)
router.get("/folder-contents/:folderId", authMiddleware, async (req, res) => {
  try {
    const { folderId } = req.params;
    const { type } = req.query;

    console.log(`Fetching folder contents for ${folderId}, type: ${type}`);

    let folder = null;
    let items = [];

    // Fetch folder and its contents based on type
    if (type === "video" || type === "folder") {
      folder = await Folder.findById(folderId);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      items = await Template.find({ folderId: folderId });
    } else if (type === "picture" || type === "picture-folder") {
      folder = await PictureFolder.findById(folderId);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      items = await PictureTemplate.find({ folderId: folderId });
    } else if (type === "video-content" || type === "video-folder") {
      folder = await VideoFolder.findById(folderId);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      items = await VideoContent.find({ folderId: folderId });
    } else if (type === "audio" || type === "audio-folder") {
      folder = await AudioFolder.findById(folderId);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      items = await AudioContent.find({ folderId: folderId });
    } else {
      return res.status(400).json({ message: "Invalid folder type" });
    }

    return res.json({
      folder: {
        _id: folder._id,
        name: folder.name,
        description: folder.description,
      },
      items,
      type,
    });
  } catch (err) {
    console.error("Error fetching folder contents:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
