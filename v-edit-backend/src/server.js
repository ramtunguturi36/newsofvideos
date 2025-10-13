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
import pictureContentRoutes from './routes/pictureContent.js';

const app = express()
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost
    if (process.env.NODE_ENV !== 'production' && origin?.startsWith('http://localhost')) {
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'http://localhost:5173',
      'https://newsofvideos.onrender.com',
      'https://newsofvideos.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean); // Remove any undefined values
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))
app.use(express.json())

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
  }
}));


app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', verifyPaymentRoutes); // This will handle /api/verify-payment
app.use('/api/purchases', purchaseRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/picture-content', pictureContentRoutes);

app.get('/health', (req, res) => res.json({ ok: true }))

// CORS test endpoint
app.get('/cors-test', (req, res) => {
  res.json({ 
    message: 'CORS is working!', 
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  })
})

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


