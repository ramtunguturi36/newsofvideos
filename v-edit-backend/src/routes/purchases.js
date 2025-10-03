import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import Purchase from '../models/Purchase.js';

const router = express.Router();

// Get all purchases for the user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const purchases = await Purchase.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    return res.json({ purchases });
  } catch (err) {
    console.error('Error fetching purchases:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific purchase
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const purchase = await Purchase.findOne({ 
      _id: req.params.id,
      userId: req.user.userId 
    });
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    return res.json({ purchase });
  } catch (err) {
    console.error('Error fetching purchase:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;