import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import Purchase from "../models/Purchase.js";

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

export default router;
