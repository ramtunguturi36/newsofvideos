import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const userAccessSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    accessType: { type: String, enum: ['template', 'folder'], required: true },
    templateId: { type: Types.ObjectId, ref: 'Template' },
    folderId: { type: Types.ObjectId, ref: 'Folder' },
    purchaseId: { type: Types.ObjectId, ref: 'Purchase', required: true },
    grantedAt: { type: Date, default: Date.now },
    // For folder access, this tracks all templates within the folder at time of purchase
    includedTemplates: [{ type: Types.ObjectId, ref: 'Template' }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound indexes for efficient queries
userAccessSchema.index({ userId: 1, accessType: 1 });
userAccessSchema.index({ userId: 1, templateId: 1 });
userAccessSchema.index({ userId: 1, folderId: 1 });

const UserAccess = model('UserAccess', userAccessSchema);

export default UserAccess;
