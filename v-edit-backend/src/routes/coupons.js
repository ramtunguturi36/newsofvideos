import express from 'express';
import Coupon from '../models/Coupon.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all coupons (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { coupons }
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons'
    });
  }
});

// Create new coupon (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      code,
      discountType,
      value,
      minOrderValue,
      maxDiscountAmount,
      usageLimit,
      expiryDate,
      description
    } = req.body;

    // Validate required fields
    if (!code || !discountType || !value) {
      return res.status(400).json({
        success: false,
        message: 'Code, discount type, and value are required'
      });
    }

    // Validate discount type and value
    if (!['percentage', 'fixed'].includes(discountType)) {
      return res.status(400).json({
        success: false,
        message: 'Discount type must be either "percentage" or "fixed"'
      });
    }

    if (discountType === 'percentage' && (value < 0 || value > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount must be between 0 and 100'
      });
    }

    if (discountType === 'fixed' && value < 0) {
      return res.status(400).json({
        success: false,
        message: 'Fixed discount must be a positive number'
      });
    }

    // Validate expiry date
    if (expiryDate && new Date(expiryDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be in the future'
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      value,
      minOrderValue: minOrderValue || 0,
      maxDiscountAmount: discountType === 'percentage' ? maxDiscountAmount : undefined,
      usageLimit: usageLimit || null,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      description,
      createdBy: req.user.userId
    });

    await coupon.save();

    const populatedCoupon = await Coupon.findById(coupon._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: { coupon: populatedCoupon },
      message: 'Coupon created successfully'
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create coupon'
    });
  }
});

// Update coupon (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      discountType,
      value,
      minOrderValue,
      maxDiscountAmount,
      usageLimit,
      expiryDate,
      description,
      isActive
    } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Validate discount type and value if provided
    if (discountType && !['percentage', 'fixed'].includes(discountType)) {
      return res.status(400).json({
        success: false,
        message: 'Discount type must be either "percentage" or "fixed"'
      });
    }

    if (value !== undefined) {
      const type = discountType || coupon.discountType;
      if (type === 'percentage' && (value < 0 || value > 100)) {
        return res.status(400).json({
          success: false,
          message: 'Percentage discount must be between 0 and 100'
        });
      }
      if (type === 'fixed' && value < 0) {
        return res.status(400).json({
          success: false,
          message: 'Fixed discount must be a positive number'
        });
      }
    }

    // Validate expiry date
    if (expiryDate && new Date(expiryDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be in the future'
      });
    }

    // Check if new code already exists (if code is being changed)
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists'
        });
      }
    }

    // Update fields
    if (code) coupon.code = code.toUpperCase();
    if (discountType) coupon.discountType = discountType;
    if (value !== undefined) coupon.value = value;
    if (minOrderValue !== undefined) coupon.minOrderValue = minOrderValue;
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (expiryDate !== undefined) coupon.expiryDate = expiryDate ? new Date(expiryDate) : undefined;
    if (description !== undefined) coupon.description = description;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    const updatedCoupon = await Coupon.findById(coupon._id)
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: { coupon: updatedCoupon },
      message: 'Coupon updated successfully'
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon'
    });
  }
});

// Delete coupon (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    await Coupon.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon'
    });
  }
});

// Validate and apply coupon (for users)
router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const { code, orderValue } = req.body;

    if (!code || orderValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and order value are required'
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is no longer active'
      });
    }

    // Check if coupon has expired
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has expired'
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has reached its usage limit'
      });
    }

    // Check minimum order value
    if (orderValue < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderValue * coupon.value) / 100;
      // Apply max discount limit if set
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.value;
      // Don't allow discount to exceed order value
      if (discountAmount > orderValue) {
        discountAmount = orderValue;
      }
    }

    const finalAmount = orderValue - discountAmount;

    res.json({
      success: true,
      data: {
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          value: coupon.value,
          description: coupon.description
        },
        originalAmount: orderValue,
        discountAmount: Math.round(discountAmount * 100) / 100,
        finalAmount: Math.round(finalAmount * 100) / 100
      },
      message: 'Coupon applied successfully'
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate coupon'
    });
  }
});

// Toggle coupon active status (admin only)
router.patch('/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    const updatedCoupon = await Coupon.findById(coupon._id)
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: { coupon: updatedCoupon },
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling coupon status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle coupon status'
    });
  }
});

export default router;
