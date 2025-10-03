import express from 'express';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/auth.js';
import Purchase from '../models/Purchase.js';
import Coupon from '../models/Coupon.js';
import { grantTemplateAccess, grantFolderAccess } from '../utils/accessControl.js';

const router = express.Router();

router.post('/verify-payment', authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Verify the payment signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Create purchase record with items from session
    const items = req.session.cartItems || [];
    const totalAmount = req.session.orderAmount || 0;
    const discountApplied = req.session.discountAmount || 0;
    const couponCode = req.session.couponCode;
    

    // Fetch actual template data with QR codes
    const itemsWithQR = await Promise.all(items.map(async (item) => {
      if (item.type === 'template') {
        try {
          // Fetch the actual template to get the real QR code
          const Template = (await import('../models/Template.js')).default;
          const template = await Template.findById(item.id);
          if (template) {
            console.log(`Template found: ID=${template._id}, title=${template.title}`);
            return {
              ...item,
              templateId: item.id,
              title: template.title,
              price: item.price,
              qrUrl: template.qrUrl, // Use the actual uploaded QR code
              videoUrl: template.videoUrl
            };
          }
        } catch (error) {
          console.error('Error fetching template:', error);
        }
      } else if (item.type === 'folder') {
        try {
          // Fetch the actual folder to get the real data
          const Folder = (await import('../models/Folder.js')).default;
          const folder = await Folder.findById(item.id);
          if (folder) {
            console.log(`Folder found: ID=${folder._id}, name=${folder.name}`);
            return {
              ...item,
              folderId: item.id,
              title: folder.name,
              price: item.price,
              description: folder.description
            };
          }
        } catch (error) {
          console.error('Error fetching folder:', error);
        }
      }
      return item;
    }));

    const purchase = await Purchase.create({
      userId: req.user.userId,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      items: itemsWithQR,
      totalAmount,
      discountApplied,
    });

    console.log('Purchase created successfully:', purchase._id);
    console.log('Purchase items with template IDs:', itemsWithQR.map(item => ({ 
      type: item.type, 
      templateId: item.templateId, 
      id: item.id,
      title: item.title 
    })));

    // Grant access to purchased items
    try {
      for (const item of itemsWithQR) {
        if (item.type === 'template' && item.templateId) {
          console.log('Granting template access for:', item.templateId);
          await grantTemplateAccess(req.user.userId, item.templateId, purchase._id);
        } else if (item.type === 'folder' && item.folderId) {
          console.log('Granting folder access for:', item.folderId);
          await grantFolderAccess(req.user.userId, item.folderId, purchase._id);
        }
      }
      console.log('Access granted successfully');
    } catch (accessError) {
      console.error('Error granting access:', accessError);
      // Don't fail the payment for access granting issues, but log it
    }

    // Update coupon usage count if a coupon was used
    if (couponCode && discountApplied > 0) {
      try {
        await Coupon.findOneAndUpdate(
          { code: couponCode.toUpperCase() },
          { $inc: { usedCount: 1 } }
        );
      } catch (couponError) {
        console.error('Error updating coupon usage:', couponError);
        // Don't fail the payment verification for coupon update issues
      }
    }

    // Clear session data
    req.session.cartItems = undefined;
    req.session.orderAmount = undefined;
    req.session.discountAmount = undefined;
    req.session.couponCode = undefined;

    console.log('Sending success response with purchaseId:', purchase._id);
    return res.json({
      message: 'Payment verification successful',
      purchaseId: purchase._id,
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;