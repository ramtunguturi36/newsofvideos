import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { backend } from "@/lib/backend";
import { validateCoupon } from "@/lib/api";
import {
  X,
  Trash2,
  ShoppingCart,
  Tag,
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

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
    total,
  } = useCart();
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const navigate = useNavigate();

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError("");

    try {
      const result = await validateCoupon(couponCode.trim(), subtotal);
      setAppliedCoupon(result.coupon);
      setDiscount(result.discountAmount);
      setCouponError("");
    } catch (error: any) {
      setCouponError(error.response?.data?.message || "Invalid coupon code");
      setAppliedCoupon(null);
      setDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setCouponCode("");
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponError("");
  }

  async function handleCheckout() {
    if (!items.length) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: "/cart" } });
        return;
      }

      const checkoutData = {
        items: items.map((item) => ({
          id: item.id,
          type: item.type,
          price: item.price,
          title: item.title,
        })),
        couponCode: appliedCoupon ? couponCode : undefined,
      };

      const response = await backend.post("/payments/checkout", checkoutData);
      const checkoutResponseData = response.data.data;

      // Load Razorpay SDK if not loaded
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Razorpay"));
          document.body.appendChild(script);
        });
      }

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
        amount: checkoutResponseData.amount,
        currency: checkoutResponseData.currency || "INR",
        name: "V-Edit Marketplace",
        description: "Purchase Templates",
        order_id: checkoutResponseData.orderId,
        prefill: {
          name: localStorage.getItem("userName") || "",
          email: localStorage.getItem("userEmail") || "",
        },
        theme: {
          color: "#7c3aed",
        },
        handler: async (response: any) => {
          try {
            // Show loading state
            setLoading(true);

            const verificationData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              items: items,
              totalAmount: total,
              discountApplied: discount,
            };

            const verifyRes = await backend.post(
              "/verify-payment",
              verificationData,
            );

            if (verifyRes.data.purchaseId) {
              clear();
              onClose();
              // Keep loading state while navigating
              navigate(
                `/payment-success?purchaseId=${verifyRes.data.purchaseId}`,
              );
            } else {
              setLoading(false);
              alert("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Payment verification failed:", err);
            setLoading(false);
            alert("Payment verification failed. Please contact support.");
          }
        },
      });

      rzp.open();
    } catch (err) {
      const error = err as AxiosError;
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert("Failed to initiate payment. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case "template":
      case "video-template":
        return "🎬";
      case "picture-template":
        return "🖼️";
      case "video-content":
        return "🎥";
      case "audio-content":
        return "🎵";
      case "folder":
      case "picture-folder":
      case "video-folder":
      case "audio-folder":
        return "📦";
      default:
        return "📄";
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-purple-600" />
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Processing Payment
              </h3>
              <p className="text-slate-600">
                Please wait while we verify your payment...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Your Cart</h2>
              <p className="text-sm text-slate-600">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-50 to-white">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <ShoppingCart className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-slate-600 mb-6">Add items to get started!</p>
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    {/* Item Icon */}
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center text-2xl">
                      {getItemIcon(item.type)}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 capitalize">
                        {item.type.replace("-", " ")}
                      </p>
                      <p className="text-lg font-bold text-purple-600 mt-1">
                        ₹{item.price}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id, item.type)}
                      className="flex-shrink-0 p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              {items.length > 1 && (
                <Button
                  onClick={() => {
                    clear();
                  }}
                  variant="outline"
                  className="w-full rounded-full border-2 border-red-200 text-red-600 hover:bg-red-50 mt-4"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Items
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer - Order Summary */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 bg-white p-6 space-y-4">
            {/* Coupon Section */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                Coupon Code
              </label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={!!appliedCoupon}
                  className="rounded-full"
                />
                {appliedCoupon ? (
                  <Button
                    onClick={handleRemoveCoupon}
                    variant="outline"
                    className="rounded-full"
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || couponLoading}
                    className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {couponLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </Button>
                )}
              </div>
              {appliedCoupon && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    Coupon "{appliedCoupon.code}" applied!
                  </span>
                </div>
              )}
              {couponError && (
                <p className="text-sm text-red-600 mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {couponError}
                </p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 pt-4 border-t border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span className="text-2xl text-purple-600">₹{total}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={loading || items.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Proceed to Pay ₹{total}
                </>
              )}
            </Button>

            {/* Info Note */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Your purchase will be available immediately after payment.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
