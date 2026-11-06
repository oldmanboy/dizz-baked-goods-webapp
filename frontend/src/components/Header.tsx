import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.js';

interface HeaderProps {
  onCartClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCartClick }) => {
  const { totalQuantity } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6F0]/90 backdrop-blur-md border-b border-amber-900/10 px-4 py-3.5 transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🍞</span>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-amber-950">
              Dizz Baked Goods
            </h1>
            <p className="text-[11px] font-medium tracking-wider text-amber-800/80 uppercase">
              Artisan Pre-Order Studio
            </p>
          </div>
        </div>

        <button
          onClick={onCartClick}
          aria-label="Open Cart"
          className="relative flex items-center justify-center p-2.5 rounded-full bg-amber-900/5 hover:bg-amber-900/10 text-amber-950 transition-colors"
        >
          <ShoppingBag className="w-5 h-5" />
          {totalQuantity > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-amber-700 text-white text-[11px] font-bold shadow-sm animate-in zoom-in-75">
              {totalQuantity}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
