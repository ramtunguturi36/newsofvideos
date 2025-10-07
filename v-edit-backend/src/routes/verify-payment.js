import express from 'express';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/auth.js';
import Purchase from '../models/Purchase.js';
import Coupon from '../models/Coupon.js';
import { grantTemplateAccess, grantFolderAccess } from '../utils/accessControl.js';

const router = express.Router();

router.post('/verify-payment', authMiddleware, async (req, res) => {
  try {
    console.log('🔐 Payment verification request received');
    console.log('🔐 User ID:', req.user.userId);
    console.log('🔐 Request body:', req.body);
    
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    console.log('🔐 Payment details:');
    console.log('🔐 Order ID:', razorpay_order_id);
    console.log('🔐 Payment ID:', razorpay_payment_id);
    console.log('🔐 Signature:', razorpay_signature);

    // Verify the payment signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    console.log('🔐 Signature verification:');
    console.log('🔐 Expected signature:', expectedSignature);
    console.log('🔐 Received signature:', razorpay_signature);
    console.log('🔐 Signatures match:', expectedSignature === razorpay_signature);

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.error('Payment signature verification failed', {
        expectedSignature,
        receivedSignature: razorpay_signature,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });
      return res.status(400).json({ 
        message: 'Payment verification failed',
        details: 'Signature verification failed'
      });
    }

    // Prefer data from request body over session
    const items = req.body.items || [];
    const totalAmount = req.body.totalAmount || 0;
    const discountApplied = req.body.discountApplied || 0;
    const couponCode = req.body.couponCode || req.session?.couponCode;
    
    console.log('📦 Processing purchase items:');
    console.log('📦 Items from request body:', req.body.items);
    console.log('📦 Items from session:', req.session.cartItems);
    console.log('📦 Total amount from request body:', req.body.totalAmount);
    console.log('📦 Total amount from session:', req.session.orderAmount);
    console.log('📦 Items count:', items.length);
    console.log('📦 Items details:', items);
    
    // Validate that we have items
    if (!items || items.length === 0) {
      console.error('No items found in request body or session');
      console.error('Request body:', JSON.stringify(req.body, null, 2));
      console.error('Session data:', JSON.stringify(req.session, null, 2));
      return res.status(400).json({ 
        message: 'No items found for purchase',
        debug: {
          requestBody: req.body,
          session: req.session,
          itemsFromBody: req.body.items,
          itemsFromSession: req.session.cartItems
        }
      });
    }

    // Fetch actual template data with QR codes
    console.log('🔄 Processing items to fetch template data...');
    const itemsWithQR = await Promise.all(items.map(async (item) => {
      console.log('🔄 Processing item:', item);
      console.log('🔄 Item type:', item.type);
      console.log('🔄 Item ID:', item.id);
      
      if (item.type === 'template') {
        console.log('📹 Processing video template');
        try {
          // Fetch the actual template to get the real QR code
          const Template = (await import('../models/Template.js')).default;
          const template = await Template.findById(item.id);
          if (template) {
            console.log(`✅ Video template found: ID=${template._id}, title=${template.title}`);
            return {
              ...item,
              templateId: item.id,
              title: template.title,
              price: item.price,
              qrUrl: template.qrUrl, // Use the actual uploaded QR code
              videoUrl: template.videoUrl
            };
          } else {
            console.log('❌ Video template not found for ID:', item.id);
          }
        } catch (error) {
          console.error('❌ Error fetching video template:', error);
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
      } else if (item.type === 'picture-template') {
        console.log('🖼️ Processing picture template');
        try {
          // Fetch the actual picture template to get the real data
          const PictureTemplate = (await import('../models/PictureTemplate.js')).default;
          const template = await PictureTemplate.findById(item.id);
          if (template) {
            console.log(`✅ Picture template found: ID=${template._id}, title=${template.title}`);
            return {
              ...item,
              templateId: item.id,
              title: template.title,
              price: item.price,
              description: template.description,
              previewImageUrl: template.previewImageUrl,
              downloadImageUrl: template.downloadImageUrl
            };
          } else {
            console.log('❌ Picture template not found for ID:', item.id);
          }
        } catch (error) {
          console.error('❌ Error fetching picture template:', error);
        }
      } else if (item.type === 'picture-folder') {
        try {
          // Fetch the actual picture folder to get the real data
          const PictureFolder = (await import('../models/PictureFolder.js')).default;
          const folder = await PictureFolder.findById(item.id);
          if (folder) {
            console.log(`Picture folder found: ID=${folder._id}, name=${folder.name}`);
            return {
              ...item,
              folderId: item.id,
              title: folder.name,
              price: item.price,
              description: folder.description
            };
          }
        } catch (error) {
          console.error('Error fetching picture folder:', error);
        }
      }
      return item;
    }));

    console.log('💾 Creating purchase record...');
    console.log('💾 User ID:', req.user.userId);
    console.log('💾 Payment ID:', razorpay_payment_id);
    console.log('💾 Order ID:', razorpay_order_id);
    console.log('💾 Items with QR:', itemsWithQR);
    console.log('💾 Total amount:', totalAmount);
    console.log('💾 Discount applied:', discountApplied);
    
    const purchase = await Purchase.create({
      userId: req.user.userId,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      items: itemsWithQR,
      totalAmount,
      discountApplied,
    });

    console.log('✅ Purchase created successfully:', purchase._id);
    console.log('✅ Purchase items with template IDs:', itemsWithQR.map(item => ({ 
      type: item.type, 
      templateId: item.templateId, 
      id: item.id,
      title: item.title 
    })));

    // Grant access to purchased items
    console.log('🔑 Granting access to purchased items...');
    try {
      for (const item of itemsWithQR) {
        console.log('🔑 Processing access for item:', item);
        console.log('🔑 Item type:', item.type);
        console.log('🔑 Item ID:', item.id);
        console.log('🔑 Template ID:', item.templateId);
        console.log('🔑 Folder ID:', item.folderId);
        
        if (item.type === 'template' && item.templateId) {
          console.log('🔑 Granting video template access for:', item.templateId);
          await grantTemplateAccess(req.user.userId, item.templateId, purchase._id);
          console.log('✅ Video template access granted');
        } else if (item.type === 'folder' && item.folderId) {
          console.log('🔑 Granting video folder access for:', item.folderId);
          await grantFolderAccess(req.user.userId, item.folderId, purchase._id);
          console.log('✅ Video folder access granted');
        } else if (item.type === 'picture-template' && item.templateId) {
          console.log('🔑 Granting picture template access for:', item.templateId);
          await grantTemplateAccess(req.user.userId, item.templateId, purchase._id);
          console.log('✅ Picture template access granted');
        } else if (item.type === 'picture-folder' && item.folderId) {
          console.log('🔑 Granting picture folder access for:', item.folderId);
          await grantFolderAccess(req.user.userId, item.folderId, purchase._id);
          console.log('✅ Picture folder access granted');
        } else {
          console.log('⚠️ No access granted for item:', item);
        }
      }
      console.log('✅ All access granted successfully');
    } catch (accessError) {
      console.error('❌ Error granting access:', accessError);
      console.error('❌ Access error details:', {
        message: accessError.message,
        stack: accessError.stack,
        name: accessError.name
      });
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

    console.log('✅ Payment verification completed successfully');
    console.log('✅ Purchase ID:', purchase._id);
    console.log('✅ Sending success response to frontend');
    
    return res.json({
      message: 'Payment verification successful',
      purchaseId: purchase._id,
    });
  } catch (err) {
    console.error('❌ Payment verification error:', err);
    console.error('❌ Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;