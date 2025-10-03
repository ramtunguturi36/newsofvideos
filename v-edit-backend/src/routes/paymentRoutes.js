const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Apply auth middleware to all payment routes
router.use(auth);

// Create Order
router.post('/checkout', async (req, res) => {
  try {
    const { items, couponCode } = req.body;
    const userId = req.user.id; // Get user ID from auth middleware
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in cart'
      });
    }
    
    // Calculate total amount (in paise for Razorpay)
    const totalAmount = items.reduce((sum, item) => {
      if (!item.price || isNaN(item.price)) {
        throw new Error(`Invalid price for item: ${item.id}`);
      }
      return sum + Math.round(item.price * 100);
    }, 0);
    
    // Create order in Razorpay with receipt containing user ID
    const order = await razorpay.orders.create({
      amount: totalAmount,
      currency: 'INR',
      receipt: `order_${userId}_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
      notes: {
        userId: userId,
        items: JSON.stringify(items.map(item => ({
          id: item.id,
          type: item.type,
          price: item.price
        })))
      }
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      discount: 0, // Apply any coupon logic here
      total: totalAmount / 100 // Convert back to rupees
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Verify Payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Create the expected signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');
    // Verify the signature
    const isSignatureValid = generated_signature === razorpay_signature;
    
    if (isSignatureValid) {
      // Save payment details to your database here
      // Example: 
      // await savePaymentDetails({
      //   userId: req.user.id,
      //   orderId: razorpay_order_id,
      //   paymentId: razorpay_payment_id,
      //   amount: req.body.totalAmount,
      //   items: req.body.items,
      //   status: 'completed'
      // });
      
      res.json({
        success: true,
        message: 'Payment verified successfully',
        purchaseId: 'purchase_' + Date.now() // Generate or get from your database
      });
    } else {
      throw new Error('Invalid signature');
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
    res.status(400).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

module.exports = router;
