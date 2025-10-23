import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";
import PictureFolder from "../models/PictureFolder.js";
import PictureTemplate from "../models/PictureTemplate.js";
import { uploadToR2 } from "../utils/r2.js";
import { addWatermark } from "../utils/watermark.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1000 * 1000 * 50 },
}); // 50MB limit for images

const router = express.Router();

// Upload cover photo for picture folder
router.post(
  "/picture-folders/:id/cover-photo",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.single("coverPhoto"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;
      if (!file) return res.status(400).json({ message: "No file uploaded" });

      const folder = await PictureFolder.findById(id);
      if (!folder) return res.status(404).json({ message: "Folder not found" });

      const bucket = process.env.R2_BUCKET;
      const ts = Date.now();
      const key = `picture-covers/${ts}-${file.originalname}`;

      const coverPhotoUrl = await uploadToR2({
        bucket,
        key,
        contentType: file.mimetype,
        body: file.buffer,
      });

      folder.coverPhotoUrl = coverPhotoUrl;
      await folder.save();

      return res.json({ folder });
    } catch (err) {
      console.error("❌ Cover photo upload error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// Create picture folder
router.post(
  "/picture-folders",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { name, parentId, description, category } = req.body;
      if (!name) return res.status(400).json({ message: "Name is required" });
      const folder = await PictureFolder.create({
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

// Upload picture template
router.post(
  "/picture-templates",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.fields([
    { name: "previewImage", maxCount: 1 },
    { name: "downloadImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, basePrice, discountPrice, parentId } = req.body;
      if (!title || !basePrice)
        return res.status(400).json({ message: "Missing fields" });
      const previewFile = req.files?.previewImage?.[0];
      const downloadFile = req.files?.downloadImage?.[0];
      if (!previewFile || !downloadFile)
        return res.status(400).json({ message: "Files missing" });

      const folderId = parentId || null;
      const bucket = process.env.R2_BUCKET;
      const ts = Date.now();
      const previewKey = `picture-previews/${ts}-${previewFile.originalname}`;
      const downloadKey = `picture-downloads/${ts}-${downloadFile.originalname}`;

      // Add watermark to preview image
      const watermarkedPreview = await addWatermark(
        previewFile.buffer,
        "PREVIEW ONLY - DO NOT COPY",
      );

      const [previewUrl, downloadUrl] = await Promise.all([
        uploadToR2({
          bucket,
          key: previewKey,
          contentType: previewFile.mimetype,
          body: watermarkedPreview,
        }),
        uploadToR2({
          bucket,
          key: downloadKey,
          contentType: downloadFile.mimetype,
          body: downloadFile.buffer,
        }),
      ]);

      const template = await PictureTemplate.create({
        folderId,
        title,
        basePrice: Number(basePrice),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        previewImageUrl: previewUrl,
        downloadImageUrl: downloadUrl,
        fileSize: downloadFile.size,
        format: downloadFile.originalname.split(".").pop().toLowerCase(),
      });

      return res.json({ template });
    } catch (err) {
      console.error("❌ Picture template upload error:", err);
      return res.status(500).json({
        message: "Server error",
        error: err.message,
        details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
    }
  },
);

// Test endpoint to check all picture templates
router.get("/test-picture-templates", async (req, res) => {
  try {
    const allTemplates = await PictureTemplate.find({}).sort({ createdAt: -1 });
    console.log(
      "🧪 Test endpoint - All picture templates:",
      allTemplates.length,
    );
    console.log(
      "🧪 Template IDs:",
      allTemplates.map((t) => t._id),
    );
    console.log(
      "🧪 Template details:",
      allTemplates.map((t) => ({
        id: t._id,
        title: t.title,
        folderId: t.folderId,
      })),
    );
    return res.json({ count: allTemplates.length, templates: allTemplates });
  } catch (err) {
    console.error("Test endpoint error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get picture hierarchy
router.get("/picture-hierarchy", async (req, res) => {
  try {
    const { folderId } = req.query;
    const filter = { parentId: folderId || null };
    const [folders, rawTemplates, path] = await Promise.all([
      PictureFolder.find(filter).sort({ createdAt: 1 }),
      PictureTemplate.find(folderId ? { folderId } : {}).sort({
        createdAt: 1,
      }),
      buildPicturePath(folderId),
    ]);

    // Fix templates to handle both discountPrice and discountedPrice fields
    const templates = rawTemplates.map((template) => {
      const templateObj = template.toObject();
      if (templateObj.discountedPrice && !templateObj.discountPrice) {
        templateObj.discountPrice = templateObj.discountedPrice;
      }
      delete templateObj.discountedPrice;
      return templateObj;
    });

    return res.json({ folders, templates, path });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get single picture template
router.get("/picture-templates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const template = await PictureTemplate.findById(id);
    if (!template)
      return res.status(404).json({ message: "Template not found" });
    return res.json({ template });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Update picture folder
router.put(
  "/picture-folders/:id",
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
        previewImageUrl,
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
      if (previewImageUrl !== undefined)
        updateData.previewImageUrl = previewImageUrl;

      const folder = await PictureFolder.findByIdAndUpdate(id, updateData, {
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

// Delete picture folder
router.delete(
  "/picture-folders/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid folder ID format" });
      }

      // Check if folder exists
      const folder = await PictureFolder.findById(id);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }

      // CASCADE DELETE: Delete all child folders recursively
      async function deleteChildFolders(folderId) {
        const children = await PictureFolder.find({ parentId: folderId });
        for (const child of children) {
          await deleteChildFolders(child._id); // Recursive delete
          await PictureFolder.findByIdAndDelete(child._id);
        }
      }

      await deleteChildFolders(id);

      // CASCADE DELETE: Delete all templates in this folder
      await PictureTemplate.deleteMany({ folderId: id });

      // Delete the folder itself
      await PictureFolder.findByIdAndDelete(id);

      return res.json({
        message: "Folder and all its contents deleted successfully",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// Update picture template
router.put(
  "/picture-templates/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  upload.fields([
    { name: "previewImage", maxCount: 1 },
    { name: "downloadImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, basePrice, discountPrice, folderId } = req.body;

      const template = await PictureTemplate.findById(id);
      if (!template)
        return res.status(404).json({ message: "Template not found" });

      const updateData = {
        title: title || template.title,
        basePrice: basePrice ? Number(basePrice) : template.basePrice,
        discountPrice: discountPrice
          ? Number(discountPrice)
          : template.discountPrice,
        folderId: folderId !== undefined ? folderId || null : template.folderId,
      };

      // Handle file uploads if provided
      const previewFile = req.files?.previewImage?.[0];
      const downloadFile = req.files?.downloadImage?.[0];

      if (previewFile || downloadFile) {
        const bucket = process.env.R2_BUCKET;
        const ts = Date.now();

        if (previewFile) {
          const previewKey = `picture-previews/${ts}-${previewFile.originalname}`;
          // Add watermark to preview image
          const watermarkedPreview = await addWatermark(
            previewFile.buffer,
            "PREVIEW ONLY - DO NOT COPY",
          );
          updateData.previewImageUrl = await uploadToR2({
            bucket,
            key: previewKey,
            contentType: previewFile.mimetype,
            body: watermarkedPreview,
          });
        }

        if (downloadFile) {
          const downloadKey = `picture-downloads/${ts}-${downloadFile.originalname}`;
          updateData.downloadImageUrl = await uploadToR2({
            bucket,
            key: downloadKey,
            contentType: downloadFile.mimetype,
            body: downloadFile.buffer,
          });
          updateData.fileSize = downloadFile.size;
          updateData.format = downloadFile.originalname
            .split(".")
            .pop()
            .toLowerCase();
        }
      }

      const updatedTemplate = await PictureTemplate.findByIdAndUpdate(
        id,
        updateData,
        { new: true },
      );
      return res.json({ template: updatedTemplate });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// Delete picture template
router.delete(
  "/picture-templates/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const template = await PictureTemplate.findByIdAndDelete(id);
      if (!template)
        return res.status(404).json({ message: "Template not found" });

      return res.json({ message: "Template deleted successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// Helper function to build picture folder path
async function buildPicturePath(folderId) {
  if (!folderId) return [];
  const path = [];
  let current = await PictureFolder.findById(folderId);
  while (current) {
    path.unshift({ _id: current._id, name: current.name });
    current = current.parentId
      ? await PictureFolder.findById(current.parentId)
      : null;
  }
  return path;
}

export default router;
