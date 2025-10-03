import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { processPayment } from '@/lib/razorpay';
import type { CartItem } from '@/context/CartContext';
import { Button } from './ui/button';

interface PaymentHandlerProps {
  items: CartItem[];
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function PaymentHandler({ items, onSuccess, onError }: PaymentHandlerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const total = items.reduce((sum, item) => sum + item.price, 0);

  const handlePayment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await processPayment(
        items,
        {
          name: user.name,
          email: user.email
        },
        navigate,
        (error) => {
          console.error('Payment failed:', error);
          onError?.(error);
        }
      );
      onSuccess?.();
    } catch (error) {
      console.error('Payment initiation failed:', error);
      onError?.(error instanceof Error ? error : new Error('Payment failed'));
    }
  };

  return (
    <Button 
      onClick={handlePayment}
      className="w-full"
      disabled={items.length === 0}
    >
      Pay ₹{total}
    </Button>
  );
}