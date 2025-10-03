import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';

// Configure dotenv with the correct path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import connectDb from './utils/db.js';
import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
import paymentRoutes from './routes/payments.js';
import verifyPaymentRoutes from './routes/verify-payment.js';
import purchaseRoutes from './routes/purchases.js';
import couponRoutes from './routes/coupons.js';
import folderRoutes from './routes/folders.js';

const app = express()
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));


app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', verifyPaymentRoutes); // This will handle /api/verify-payment
app.use('/api/purchases', purchaseRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/folders', folderRoutes);

app.get('/health', (req, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 5000;

// Start the server
const startServer = async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


