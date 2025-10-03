import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const couponSchema = new Schema(
  {
    code: { type: String, unique: true, required: true, uppercase: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number }, // For percentage coupons
    usageLimit: { type: Number, default: null }, // null means unlimited
    usedCount: { type: Number, default: 0 },
    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true },
    description: { type: String },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Coupon = model('Coupon', couponSchema);

export default Coupon;


