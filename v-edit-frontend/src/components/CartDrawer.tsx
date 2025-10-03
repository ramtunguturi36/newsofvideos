import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { backend } from '@/lib/backend';
import { validateCoupon } from '@/lib/api';
import { Ticket, X } from 'lucide-react';

interface CartItem {
  id: string;
  type: 'template' | 'folder';
  title: string;
  price: number;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface CheckoutResponse {
  orderId: string;
  amount: number;
  currency: string;
  discount: number;
  total: number;
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { 
    items, 
    removeItem, 
    clear, 
    couponCode, 
    setCouponCode, 
    appliedCoupon, 
    setAppliedCoupon, 
    discount, 
    setDiscount,
    subtotal,
    total
  } = useCart();
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    setCouponError('');
    
    try {
      const result = await validateCoupon(couponCode.trim(), subtotal);
      setAppliedCoupon(result.coupon);
      setDiscount(result.discountAmount);
      setCouponError('');
    } catch (error: any) {
      setCouponError(error.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
      setDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponError('');
  }

  async function handleCheckout() {
    if (!items.length) return;
    setLoading(true);

    try {
      // Check authentication
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { from: '/cart' } });
        return;
      }

      // Create order
      const response = await backend.post<{ success: boolean; data: CheckoutResponse }>('/payments/checkout', {
        items: items.map(item => ({
          id: item.id,
          type: item.type,
          price: item.price,
          title: item.title
        })),
        couponCode: appliedCoupon ? couponCode : undefined
      });
      
      const checkoutData = response.data.data;

      // Load Razorpay SDK if not loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay'));
          document.body.appendChild(script);
        });
      }

      // Initialize Razorpay checkout
      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount: checkoutData.amount,
        currency: checkoutData.currency || 'INR',
        name: 'V-Edit Marketplace',
        description: 'Purchase Templates',
        order_id: checkoutData.orderId,
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || ''
        },
        theme: {
          color: '#2563eb'
        },
        handler: async (response: RazorpayResponse) => {
          try {
            console.log('Payment response received:', response);
            console.log('Verifying payment...');
            
            const verifyRes = await backend.post('/verify-payment', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            console.log('Payment verification response:', verifyRes.data);

            if (verifyRes.data.purchaseId) {
              console.log('Payment successful, navigating to success page...');
              clear();
              onClose();
              navigate(`/payment-success?purchaseId=${verifyRes.data.purchaseId}`);
            } else {
              console.error('No purchaseId in response:', verifyRes.data);
              alert('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Payment verification failed:', err);
            alert('Payment verification failed. Please contact support.');
          }
        }
      });

      rzp.open();
    } catch (err) {
      const error = err as AxiosError;
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert('Failed to initiate payment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end">
      <div className="w-full max-w-md h-full bg-gray-900 shadow-xl flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Your Cart</h2>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-500">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <div>
                    <div className="text-sm text-gray-400">{item.type}</div>
                    <div className="font-medium text-white">{item.title}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-white">₹{item.price}</div>
                    <Button 
                      variant="outline" 
                      onClick={() => removeItem(item.id, item.type)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-900 space-y-4">
          {/* Coupon Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Have a coupon?</span>
            </div>
            
            {!appliedCoupon ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  disabled={couponLoading}
                />
                <Button 
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || couponLoading}
                  className="bg-green-600 hover:bg-green-500"
                >
                  {couponLoading ? 'Checking...' : 'Apply'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-900/20 border border-green-600/20 rounded-md p-2">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400 font-medium">{appliedCoupon.code}</span>
                  <span className="text-xs text-gray-400">
                    ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.value}%` : `₹${appliedCoupon.value}`})
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRemoveCoupon}
                  className="text-gray-400 hover:text-white h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {couponError && (
              <p className="text-sm text-red-400">{couponError}</p>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-2 text-white">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-400">Discount:</span>
                <span className="text-green-400">-₹{discount}</span>
              </div>
            )}
            
            <div className="flex justify-between font-medium text-lg border-t border-gray-700 pt-2">
              <span>Total:</span>
              <span>₹{total}</span>
            </div>
          </div>

          <Button 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white" 
            onClick={handleCheckout} 
            disabled={loading || items.length === 0}
          >
            {loading ? 'Processing...' : `Pay ₹${total}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
