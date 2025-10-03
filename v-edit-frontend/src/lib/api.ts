import axios from 'axios';
import type { Folder, TemplateItem, ApiResponse, Coupon, CouponValidationResult, UserAccess, FolderPreview } from './types';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export const getHierarchy = async (folderId?: string): Promise<{
  folders: Folder[];
  templates: TemplateItem[];
  path: Folder[];
}> => {
  const response = await api.get<ApiResponse<{
    folders: Folder[];
    templates: TemplateItem[];
    path: Folder[];
  }>>(`/hierarchy${folderId ? `?folderId=${folderId}` : ''}`);
  return response.data.data;
};

export const getPurchasedTemplates = async (): Promise<TemplateItem[]> => {
  const response = await api.get<ApiResponse<{ templates: TemplateItem[] }>>('/user/purchases');
  return response.data.data.templates;
};

export const createOrder = async (items: Array<{ id: string; type: string; price: number }>, couponCode?: string) => {
  const response = await api.post<ApiResponse<{
    orderId: string;
    amount: number;
    currency: string;
    discount: number;
  }>>('/checkout', { items, couponCode });
  return response.data.data;
};

export const verifyPayment = async (paymentData: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  items: Array<{ type: string; templateId?: string; folderId?: string }>;
  discountApplied: number;
  totalAmount: number;
}) => {
  const response = await api.post<ApiResponse<{ purchaseId: string }>>('/verify-payment', paymentData);
  return response.data.data;
};

// Coupon API functions
export const getCoupons = async (): Promise<Coupon[]> => {
  const response = await api.get<ApiResponse<{ coupons: Coupon[] }>>('/coupons');
  return response.data.data.coupons;
};

export const createCoupon = async (couponData: {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  expiryDate?: string;
  description?: string;
}): Promise<Coupon> => {
  const response = await api.post<ApiResponse<{ coupon: Coupon }>>('/coupons', couponData);
  return response.data.data.coupon;
};

export const updateCoupon = async (id: string, couponData: Partial<{
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxDiscountAmount: number;
  usageLimit: number;
  expiryDate: string;
  description: string;
  isActive: boolean;
}>): Promise<Coupon> => {
  const response = await api.put<ApiResponse<{ coupon: Coupon }>>(`/coupons/${id}`, couponData);
  return response.data.data.coupon;
};

export const deleteCoupon = async (id: string): Promise<void> => {
  await api.delete(`/coupons/${id}`);
};

export const toggleCouponStatus = async (id: string): Promise<Coupon> => {
  const response = await api.patch<ApiResponse<{ coupon: Coupon }>>(`/coupons/${id}/toggle`);
  return response.data.data.coupon;
};

export const validateCoupon = async (code: string, orderValue: number): Promise<CouponValidationResult> => {
  const response = await api.post<ApiResponse<CouponValidationResult>>('/coupons/validate', {
    code,
    orderValue
  });
  return response.data.data;
};

// Folder API functions
export const getPurchasableFolders = async (): Promise<Folder[]> => {
  const response = await api.get<ApiResponse<{ folders: Folder[] }>>('/folders/purchasable');
  return response.data.data.folders;
};

export const getFolderPreview = async (folderId: string): Promise<FolderPreview> => {
  const response = await api.get<ApiResponse<FolderPreview>>(`/folders/${folderId}/preview`);
  return response.data.data;
};

export const checkFolderAccess = async (folderId: string): Promise<UserAccess> => {
  const response = await api.get<ApiResponse<UserAccess>>(`/folders/${folderId}/access`);
  return response.data.data;
};

export const getAdminFolders = async (): Promise<Folder[]> => {
  const response = await api.get<ApiResponse<{ folders: Folder[] }>>('/folders/admin');
  return response.data.data.folders;
};

export const updateFolderPricing = async (folderId: string, data: {
  basePrice?: number;
  discountPrice?: number;
  isPurchasable?: boolean;
  description?: string;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
}): Promise<Folder> => {
  const response = await api.put<ApiResponse<{ folder: Folder }>>(`/folders/${folderId}/pricing`, data);
  return response.data.data.folder;
};

export const getPurchasedFolders = async (): Promise<Folder[]> => {
  const response = await api.get<ApiResponse<{ folders: Folder[] }>>('/folders/user/purchased');
  return response.data.data.folders;
};

export default api;
