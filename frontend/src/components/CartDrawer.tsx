import React from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext.js';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    fulfillmentDate,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const formattedSubtotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(subtotal);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between safe-bottom z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-amber-900/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧺</span>
            <h2 className="font-serif font-bold text-lg text-amber-950">Your Bread Basket</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-stone-400 py-12">
              <span className="text-4xl opacity-60">🥖</span>
              <p className="text-sm font-medium text-stone-500">Your basket is empty</p>
              <p className="text-xs max-w-xs">
                Browse our slow-fermented artisan sourdough and sweet bakes to add to your weekend Pre-Order.
              </p>
            </div>
          ) : (
            <>
              {!fulfillmentDate && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>Please select a bake fulfillment date on the catalog page before placing your order.</span>
                </div>
              )}

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200/60"
                  >
                    <div className="space-y-0.5 flex-1 pr-2">
                      <h4 className="text-xs font-bold text-amber-950">{item.name}</h4>
                      <p className="text-xs font-semibold text-amber-900">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          maximumFractionDigits: 0,
                        }).format(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded text-stone-600 hover:bg-stone-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-amber-800 text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={clearCart}
                  className="text-[11px] font-semibold text-stone-500 hover:text-red-700 underline"
                >
                  Clear basket
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-amber-900/10 space-y-3 bg-[#FAF6F0]/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600 font-medium">Bakes Subtotal</span>
              <span className="font-bold text-amber-950 text-base">{formattedSubtotal}</span>
            </div>
            <p className="text-[11px] text-stone-500">
              *A unique 2-digit verification code (+Rp 01–99) will be assigned at checkout for QRIS payment verification.
            </p>

            <button
              onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
              }}
              disabled={!fulfillmentDate}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 text-white font-bold text-sm shadow-md transition-all"
            >
              <span>Continue to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
