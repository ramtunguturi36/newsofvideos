import { loadScript } from './utils';
import type { CartItem } from '@/context/CartContext';
import { backend } from './backend';
import type { AxiosResponse } from 'axios';

declare const Razorpay: any;

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: any) => void;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export const initializeRazorpay = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      loadScript('https://checkout.razorpay.com/v1/checkout.js', 'razorpay-sdk')
        .then(() => resolve(true))
        .catch(() => resolve(false));
    } else {
      resolve(false);
    }
  });
};

export const createRazorpayOrder = async (items: CartItem[], couponCode?: string): Promise<{ orderId: string; amount: number }> => {
  try {
    const response = await backend.post('/payments/checkout', { items, couponCode });
    return response.data;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const processPayment = async (
  items: CartItem[],
  user: { name?: string; email?: string; phone?: string },
  navigate: (path: string) => void,
  onError: (error: Error) => void
) => {
  try {
    const isRazorpayLoaded = await initializeRazorpay();
    if (!isRazorpayLoaded) {
      throw new Error('Razorpay SDK failed to load');
    }

    // Calculate total amount in paise (Razorpay expects amount in smallest currency unit)
    const totalAmount = items.reduce((sum, item) => sum + (item.price * 100), 0);
    const totalAmountInRupees = items.reduce((sum, item) => sum + item.price, 0);
    
    // Create order on your backend
    const order = await createRazorpayOrder(items);

    const options: RazorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
      amount: order.amount,
      currency: 'INR',
      name: 'Your App Name',
      description: `Order for ${items.length} items`,
      order_id: order.orderId,
      handler: function (response) {
        // Verify the payment on your server
        backend.post('/verify-payment', {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          items: items, // Pass items directly
          totalAmount: totalAmountInRupees,
          discountApplied: 0 // You can calculate this if needed
        })
        .then(res => {
          if (res.data.purchaseId) {
            navigate(`/payment-success?purchaseId=${res.data.purchaseId}`);
          }
        })
        .catch(err => {
          console.error('Payment verification failed:', err);
          onError(new Error('Payment verification failed'));
        });
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone || '',
      },
      notes: {
        items: JSON.stringify(items.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          type: item.type,
        }))),
      },
      theme: {
        color: '#4F46E5', // Indigo-600
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal dismissed');
        },
      },
    };

    const paymentObject = new Razorpay(options);
    paymentObject.open();
    
    // Add event listeners for better tracking
    paymentObject.on('payment.failed', function (response: any) {
      console.error('Payment failed:', response.error);
      onError(new Error(response.error.description || 'Payment failed'));
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    onError(error instanceof Error ? error : new Error('Payment processing failed'));
  }
};

export const verifyPayment = async (paymentId: string, orderId: string, signature: string) => {
  try {
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        paymentId,
        orderId,
        signature,
      }),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    return response.json();
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};
