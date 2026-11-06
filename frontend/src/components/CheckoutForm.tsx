import React, { useState } from 'react';
import { User, Phone, MapPin, FileText, ArrowLeft, Loader2, Store, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext.js';

interface CheckoutFormProps {
  onBack: () => void;
  onSubmit: (formData: CheckoutFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface CheckoutFormData {
  name: string;
  whatsapp: string;
  fulfillmentType: 'pickup' | 'delivery';
  address: string;
  notes: string;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onBack,
  onSubmit,
  isSubmitting,
}) => {
  const { subtotal, fulfillmentDate, items } = useCart();
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!whatsapp.trim()) {
      setError('Please enter your active WhatsApp number.');
      return;
    }

    if (fulfillmentType === 'delivery' && !address.trim()) {
      setError('Please provide your courier delivery destination address.');
      return;
    }

    try {
      await onSubmit({
        name,
        whatsapp,
        fulfillmentType,
        address,
        notes,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit order. Please check your information.');
    }
  };

  const formattedSubtotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(subtotal);

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-amber-950 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Bread Catalog</span>
      </button>

      <div className="bg-white rounded-2xl p-6 border border-amber-900/10 shadow-sm space-y-5">
        <div>
          <h2 className="font-serif text-xl font-bold text-amber-950">Pre-Order Checkout</h2>
          <p className="text-xs text-stone-500 mt-1">
            Scheduled for Bake Date: <strong className="text-amber-900 font-bold">{fulfillmentDate}</strong>
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-800" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Siti Rahma"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all"
            />
          </div>

          {/* WhatsApp Number */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-800" />
              <span>WhatsApp Number</span>
            </label>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="e.g. 081234567890"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all"
            />
            <p className="text-[11px] text-stone-400">
              Used strictly for Pre-Order batch reminders and courier coordination.
            </p>
          </div>

          {/* Fulfillment Method Selection */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-stone-700">Fulfillment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFulfillmentType('pickup')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold gap-1.5 transition-all ${
                  fulfillmentType === 'pickup'
                    ? 'bg-amber-900/10 border-amber-900 text-amber-950 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Store className="w-4 h-4 text-amber-800" />
                <span>Self-Pickup</span>
                <span className="text-[10px] text-stone-500 font-normal">Kebayoran Studio</span>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('delivery')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold gap-1.5 transition-all ${
                  fulfillmentType === 'delivery'
                    ? 'bg-amber-900/10 border-amber-900 text-amber-950 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Truck className="w-4 h-4 text-amber-800" />
                <span>Courier Delivery</span>
                <span className="text-[10px] text-stone-500 font-normal">Instant / Same-Day</span>
              </button>
            </div>
          </div>

          {/* Address (If delivery) */}
          {fulfillmentType === 'delivery' && (
            <div className="space-y-1 animate-in fade-in duration-200">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-800" />
                <span>Delivery Address</span>
              </label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full street address, building/unit, benchmark..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all resize-none"
              />
            </div>
          )}

          {/* Order Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-800" />
              <span>Baker Notes (Optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Slicing requests, gate instructions..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 outline-none transition-all"
            />
          </div>

          {/* Summary Banner */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-600 font-medium">Breads in Order ({items.length})</span>
              <span className="font-bold text-amber-950">{formattedSubtotal}</span>
            </div>
            <p className="text-[11px] text-stone-500">
              Next step: Dynamic QRIS code will be generated with an automated 2-digit unique code (+Rp 01–99).
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 text-white font-bold text-sm shadow-md transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Dynamic QRIS...</span>
              </>
            ) : (
              <span>Proceed to Dynamic QRIS Payment</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
