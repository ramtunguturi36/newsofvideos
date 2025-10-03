import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { authMiddleware } from '../middleware/auth.js';
import Coupon from '../models/Coupon.js';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';

const router = express.Router()

function calcTotals(items, coupon) {
  const subtotal = items.reduce((sum, it) => sum + Number(it.price || 0), 0)
  let discount = 0
  
  if (coupon) {
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.value) / 100
      // Apply max discount limit if set
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount
      }
    } else {
      discount = coupon.value
      // Don't allow discount to exceed subtotal
      if (discount > subtotal) {
        discount = subtotal
      }
    }
  }
  
  const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100)
  return { subtotal, discount, total }
}

router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const { items, couponCode } = req.body
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'No items' })

    let coupon = null
    let couponError = null
    
    if (couponCode) {
      const c = await Coupon.findOne({ code: couponCode.toUpperCase() })
      
      if (!c) {
        couponError = 'Invalid coupon code'
      } else if (!c.isActive) {
        couponError = 'This coupon is no longer active'
      } else if (c.expiryDate && new Date() > c.expiryDate) {
        couponError = 'This coupon has expired'
      } else if (c.usageLimit && c.usedCount >= c.usageLimit) {
        couponError = 'This coupon has reached its usage limit'
      } else {
        // Calculate subtotal first to check minimum order value
        const tempSubtotal = items.reduce((sum, it) => sum + Number(it.price || 0), 0)
        if (tempSubtotal < c.minOrderValue) {
          couponError = `Minimum order value of ₹${c.minOrderValue} required for this coupon`
        } else {
          coupon = c
        }
      }
      
      if (couponError) {
        return res.status(400).json({
          success: false,
          message: couponError
        })
      }
    }
    const { total, discount, subtotal } = calcTotals(items, coupon)

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) {
      return res.status(400).json({
        message: 'Payment gateway not configured',
        hint: 'Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env',
        subtotal,
        discount,
        total,
      })
    }

    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret })
    const order = await rzp.orders.create({ amount: Math.round(total * 100), currency: 'INR' })

    // Store cart items and amounts in session for verification
    req.session.cartItems = items.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title,
      price: item.price,
      videoUrl: item.videoUrl,
      templateId: item.type === 'template' ? item.id : undefined,
      folderId: item.type === 'folder' ? item.id : undefined
    }))
    req.session.orderAmount = total
    req.session.discountAmount = discount
    req.session.couponCode = couponCode || null
    await req.session.save()  // Make sure session is saved

    return res.json({ 
      success: true,
      data: {
        orderId: order.id, 
        amount: order.amount,
        currency: order.currency, 
        subtotal, 
        discount, 
        total
      }
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Verify payment and purchase endpoints moved to their respective route files

router.post('/coupons', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { code, discountType, value, expiryDate, isActive } = req.body;
    const coupon = await Coupon.create({ code, discountType, value, expiryDate, isActive });
    return res.json({ coupon });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Test endpoint to check if database connection is working
router.get('/test-db', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const purchaseCount = await Purchase.countDocuments();
    const couponCount = await Coupon.countDocuments();
    
    return res.json({ 
      userCount, 
      purchaseCount, 
      couponCount,
      message: 'Database connection is working'
    });
  } catch (err) {
    console.error('Database test error:', err);
    return res.status(500).json({ 
      message: 'Database connection error', 
      error: err.message 
    });
  }
});

// Admin dashboard endpoints
router.get('/admin/stats', authMiddleware, async (req, res) => {
  try {
    console.log('Admin stats request received for user:', req.user);
    
    if (req.user.role !== 'admin') {
      console.log('Access denied - user is not admin');
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // Test database connections first
    try {
      await User.countDocuments();
      await Purchase.countDocuments();
    } catch (dbErr) {
      console.error('Database connection test failed:', dbErr);
      return res.status(500).json({ 
        message: 'Database connection error', 
        error: dbErr.message 
      });
    }
    
    console.log('Fetching admin stats...');
    
    // Get total users
    const totalUsers = await User.countDocuments({ role: 'user' }).catch(err => {
      console.error('Error counting users:', err);
      return 0;
    });
    console.log('Total users:', totalUsers);
    
    // Get all users (excluding admins)
    const users = await User.find({ role: 'user' }).select('name email createdAt').catch(err => {
      console.error('Error fetching users:', err);
      return [];
    });
    console.log('Users fetched:', users.length);
    
    // Get total sales and sales data
    const purchases = await Purchase.find().populate('userId', 'name email').catch(err => {
      console.error('Error fetching purchases:', err);
      return [];
    });
    console.log('Purchases fetched:', purchases.length);
    
    const totalSales = purchases.reduce((sum, purchase) => {
      const amount = purchase.totalAmount || 0;
      return sum + amount;
    }, 0);
    console.log('Total sales calculated:', totalSales);
    
    const result = { 
      totalUsers, 
      users: users || [],
      totalSales,
      totalPurchases: purchases.length 
    };
    
    console.log('Sending admin stats response');
    return res.json(result);
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ 
      message: 'Server error while fetching admin stats', 
      error: err.message 
    });
  }
});

export default router;


