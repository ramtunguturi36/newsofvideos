import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import mongoose from "mongoose";

const router = express.Router();

// Get all users (admin only)
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const users = await User.find(query)
      .select("-passwordHash -resetPasswordToken -resetPasswordExpires")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // Get purchase counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const purchaseCount = await Purchase.countDocuments({
          userId: user._id,
        });
        const purchases = await Purchase.find({ userId: user._id });
        const totalSpent = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

        return {
          ...user.toObject(),
          stats: {
            totalPurchases: purchaseCount,
            totalSpent: totalSpent,
          },
        };
      }),
    );

    return res.json({
      users: usersWithStats,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get all purchases (admin only)
router.get("/purchases", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      userId,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};

    if (userId) {
      query.userId = userId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const purchases = await Purchase.find(query)
      .populate("userId", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Purchase.countDocuments(query);

    return res.json({
      purchases,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Error fetching purchases:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get daily revenue analytics (admin only)
router.get(
  "/analytics/daily-revenue",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { startDate, endDate, days = 30 } = req.query;

      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate
        ? new Date(startDate)
        : new Date(end.getTime() - parseInt(days) * 24 * 60 * 60 * 1000);

      const dailyRevenue = await Purchase.aggregate([
        {
          $match: {
            createdAt: {
              $gte: start,
              $lte: end,
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            totalRevenue: { $sum: "$totalAmount" },
            totalOrders: { $sum: 1 },
            totalDiscount: { $sum: "$discountApplied" },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
            "_id.day": 1,
          },
        },
        {
          $project: {
            _id: 0,
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day",
              },
            },
            totalRevenue: 1,
            totalOrders: 1,
            totalDiscount: 1,
          },
        },
      ]);

      return res.json({ dailyRevenue });
    } catch (err) {
      console.error("Error fetching daily revenue:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// Get purchase analytics by category (admin only)
router.get(
  "/analytics/by-category",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const query = {};
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      const categoryStats = await Purchase.aggregate([
        {
          $match: query,
        },
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: "$items.type",
            totalRevenue: { $sum: "$items.price" },
            totalItems: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            category: "$_id",
            totalRevenue: 1,
            totalItems: 1,
          },
        },
        {
          $sort: { totalRevenue: -1 },
        },
      ]);

      return res.json({ categoryStats });
    } catch (err) {
      console.error("Error fetching category analytics:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// Get dashboard summary statistics (admin only)
router.get(
  "/analytics/summary",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      // Total users
      const totalUsers = await User.countDocuments({ role: "user" });

      // Total revenue
      const revenueData = await Purchase.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            totalOrders: { $sum: 1 },
            totalDiscount: { $sum: "$discountApplied" },
          },
        },
      ]);

      const {
        totalRevenue = 0,
        totalOrders = 0,
        totalDiscount = 0,
      } = revenueData[0] || {};

      // Revenue from last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const last30DaysRevenue = await Purchase.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            totalOrders: { $sum: 1 },
          },
        },
      ]);

      const {
        totalRevenue: last30DaysTotal = 0,
        totalOrders: last30DaysOrders = 0,
      } = last30DaysRevenue[0] || {};

      // Revenue from previous 30 days (for comparison)
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const previous30DaysRevenue = await Purchase.aggregate([
        {
          $match: {
            createdAt: {
              $gte: sixtyDaysAgo,
              $lt: thirtyDaysAgo,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            totalOrders: { $sum: 1 },
          },
        },
      ]);

      const {
        totalRevenue: previous30DaysTotal = 0,
        totalOrders: previous30DaysOrders = 0,
      } = previous30DaysRevenue[0] || {};

      // Calculate percentage changes
      const revenueChange =
        previous30DaysTotal > 0
          ? ((last30DaysTotal - previous30DaysTotal) / previous30DaysTotal) *
            100
          : 100;

      const ordersChange =
        previous30DaysOrders > 0
          ? ((last30DaysOrders - previous30DaysOrders) / previous30DaysOrders) *
            100
          : 100;

      // New users in last 30 days
      const newUsers = await User.countDocuments({
        role: "user",
        createdAt: { $gte: thirtyDaysAgo },
      });

      // Previous 30 days new users
      const previousNewUsers = await User.countDocuments({
        role: "user",
        createdAt: {
          $gte: sixtyDaysAgo,
          $lt: thirtyDaysAgo,
        },
      });

      const usersChange =
        previousNewUsers > 0
          ? ((newUsers - previousNewUsers) / previousNewUsers) * 100
          : 100;

      // Top selling items
      const topItems = await Purchase.aggregate([
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: {
              title: "$items.title",
              type: "$items.type",
            },
            totalSales: { $sum: 1 },
            totalRevenue: { $sum: "$items.price" },
          },
        },
        {
          $sort: { totalSales: -1 },
        },
        {
          $limit: 5,
        },
        {
          $project: {
            _id: 0,
            title: "$_id.title",
            type: "$_id.type",
            totalSales: 1,
            totalRevenue: 1,
          },
        },
      ]);

      return res.json({
        summary: {
          totalUsers,
          totalRevenue,
          totalOrders,
          totalDiscount,
          last30Days: {
            revenue: last30DaysTotal,
            orders: last30DaysOrders,
            newUsers,
          },
          changes: {
            revenueChange: parseFloat(revenueChange.toFixed(2)),
            ordersChange: parseFloat(ordersChange.toFixed(2)),
            usersChange: parseFloat(usersChange.toFixed(2)),
          },
          topItems,
        },
      });
    } catch (err) {
      console.error("Error fetching summary:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// Get user details with purchase history (admin only)
router.get(
  "/users/:userId",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId).select(
        "-passwordHash -resetPasswordToken -resetPasswordExpires",
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const purchases = await Purchase.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10);

      const purchaseStats = await Purchase.aggregate([
        {
          $match: { userId: new mongoose.Types.ObjectId(userId) },
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: "$totalAmount" },
            totalOrders: { $sum: 1 },
            totalDiscount: { $sum: "$discountApplied" },
          },
        },
      ]);

      const stats = purchaseStats[0] || {
        totalSpent: 0,
        totalOrders: 0,
        totalDiscount: 0,
      };

      return res.json({
        user: {
          ...user.toObject(),
          stats,
        },
        recentPurchases: purchases,
      });
    } catch (err) {
      console.error("Error fetching user details:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

// Clear all purchases (admin only) - Keep users intact
router.delete(
  "/purchases/clear-all",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const result = await Purchase.deleteMany({});

      return res.json({
        message: "All purchases cleared successfully",
        deletedCount: result.deletedCount,
      });
    } catch (err) {
      console.error("Error clearing purchases:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

export default router;
