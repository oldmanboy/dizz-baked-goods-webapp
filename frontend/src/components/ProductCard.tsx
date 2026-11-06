import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext.js';

export interface ProductProps {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  allergens: string[];
  weightGrams: number;
  available: boolean;
}

export const ProductCard: React.FC<{ product: ProductProps }> = ({ product }) => {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.productId === product.id);
  const quantity = cartItem?.quantity || 0;

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <article className="bg-white rounded-2xl border border-amber-900/10 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      {/* Product Image Container */}
      <div className="relative aspect-[4/3] bg-amber-100/50 flex items-center justify-center overflow-hidden">
        <span className="text-5xl opacity-80 select-none">🥖</span>
        <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[11px] font-bold text-stone-700 shadow-xs">
          {product.weightGrams}g
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <h3 className="font-serif font-bold text-base text-amber-950 leading-snug">
            {product.name}
          </h3>
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Allergen chips */}
          {product.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {product.allergens.map((alg) => (
                <span
                  key={alg}
                  className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500 text-[10px] font-medium"
                >
                  {alg}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price & Quantity Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-amber-900/5">
          <span className="text-sm font-bold text-amber-900">{formattedPrice}</span>

          {quantity === 0 ? (
            <button
              onClick={() =>
                addItem({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                })
              }
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-900/15 rounded-xl p-0.5">
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-amber-950 shadow-xs hover:bg-amber-100 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-amber-950 w-5 text-center">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-800 text-white shadow-xs hover:bg-amber-900 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
