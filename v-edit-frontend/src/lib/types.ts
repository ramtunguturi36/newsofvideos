export interface Folder {
  _id: string;
  name: string;
  parentId: string | null;
  description?: string;
  basePrice: number;
  discountPrice?: number;
  isPurchasable: boolean;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  totalTemplates: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  sampleTemplates?: TemplateItem[];
}

export interface TemplateItem {
  _id: string;
  title: string;
  description?: string;
  basePrice: number;
  discountPrice?: number;
  videoUrl: string;
  qrUrl: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  type: 'template' | 'folder';
  title: string;
  price: number;
  data: any;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  expiryDate?: string;
  isActive: boolean;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidationResult {
  coupon: {
    code: string;
    discountType: 'percentage' | 'fixed';
    value: number;
    description?: string;
  };
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

export interface UserAccess {
  _id: string;
  userId: string;
  accessType: 'template' | 'folder';
  templateId?: string;
  folderId?: string;
  purchaseId: string;
  grantedAt: string;
  includedTemplates?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface UserAccess {
  hasAccess: boolean;
  purchaseDate: string | null;
  templates: TemplateItem[];
}

export interface FolderPreview {
  _id: string;
  name: string;
  description?: string;
  basePrice?: number;
  discountPrice?: number;
  isPurchasable: boolean;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  templateCount: number;
  templates: TemplateItem[];
}
