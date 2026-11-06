import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client.js';
import { QrisPaymentView } from '../components/QrisPaymentView.js';
import { ReceiptUploader } from '../components/ReceiptUploader.js';
import { useCart } from '../context/CartContext.js';
import { CheckCircle, Clock, Loader2, ArrowLeft, Store, Calendar } from 'lucide-react';

interface OrderState {
  orderCode: string;
  orderToken: string;
  status: 'AWAITING_PAYMENT' | 'PAID_PENDING_VERIFICATION' | 'VERIFIED_PAID' | 'REJECTED' | 'EXPIRED';
  fulfillment: {
    type: string;
    date: string;
  };
  customer: {
    name: string;
    whatsapp: string;
  };
  payment: {
    subtotal: number;
    uniqueCode: number;
    totalAmount: number;
    qrisQrDataUrl: string;
    receiptUploadedAt?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  expiresAt: string;
}

export const OrderPaymentPage: React.FC<{
  orderToken: string;
  onBackToHome: () => void;
}> = ({ orderToken, onBackToHome }) => {
  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = () => {
    apiFetch<OrderState>(`/api/v1/orders/${orderToken}`)
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Could not load order details.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrder();
  }, [orderToken]);

  const handleUploadReceipt = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('receipt', file);

    try {
      await apiFetch(`/api/v1/orders/${orderToken}/confirm-payment`, {
        method: 'POST',
        body: formData,
      });

      // Clear the cart upon successful receipt submission
      clearCart();
      fetchOrder();
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 text-amber-800 animate-spin" />
        <p className="text-xs font-semibold text-amber-950">Retrieving order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-red-200 text-center space-y-3">
        <h3 className="font-serif font-bold text-base text-stone-900">Order Not Found</h3>
        <p className="text-xs text-stone-600">{error || 'This order could not be located.'}</p>
        <button
          onClick={onBackToHome}
          className="px-4 py-2 rounded-xl bg-amber-800 text-white text-xs font-bold"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  // View 1: Payment Confirmed Summary
  if (order.status === 'PAID_PENDING_VERIFICATION' || order.status === 'VERIFIED_PAID') {
    return (
      <div className="max-w-xl mx-auto p-4 py-8 space-y-6 safe-bottom">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-amber-900/10 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle className="w-9 h-9" />
          </div>

          <div className="space-y-1.5">
            <h2 className="font-serif text-2xl font-bold text-amber-950">
              Pre-Order Payment Received!
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              Thank you, <strong>{order.customer.name}</strong>. Your payment proof has been uploaded. The baker will verify the transfer in our ledger and start preparing your fresh weekend bake batch.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 text-left space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-amber-900/10 pb-2">
              <span className="font-bold text-stone-600">Order Code:</span>
              <span className="font-mono font-bold text-amber-950">{order.orderCode}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-stone-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-800" />
                <span>Bake Date:</span>
              </span>
              <span className="font-bold text-amber-950">{order.fulfillment.date}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-stone-600 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-800" />
                <span>Fulfillment:</span>
              </span>
              <span className="font-bold text-amber-950 capitalize">{order.fulfillment.type}</span>
            </div>
            <div className="flex justify-between items-center border-t border-amber-900/10 pt-2 text-sm">
              <span className="font-bold text-stone-800">Total QRIS Transferred:</span>
              <span className="font-bold text-amber-900">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                }).format(order.payment.totalAmount)}
              </span>
            </div>
          </div>

          <button
            onClick={onBackToHome}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm shadow-md transition-all"
          >
            Order More Artisanal Breads
          </button>
        </div>
      </div>
    );
  }

  // View 2: Active Payment Screen (QRIS + Receipt Upload)
  return (
    <div className="max-w-xl mx-auto p-4 py-6 space-y-6 safe-bottom">
      <button
        onClick={onBackToHome}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-amber-950 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Storefront</span>
      </button>

      {/* Dynamic QRIS Presentation */}
      <QrisPaymentView
        orderCode={order.orderCode}
        subtotal={order.payment.subtotal}
        uniqueCode={order.payment.uniqueCode}
        totalAmount={order.payment.totalAmount}
        qrisQrDataUrl={order.payment.qrisQrDataUrl}
        expiresAt={order.expiresAt}
      />

      {/* Payment Proof Receipt Upload */}
      <ReceiptUploader
        onUpload={handleUploadReceipt}
        isUploading={isUploading}
      />
    </div>
  );
};
