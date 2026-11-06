import React, { useState } from 'react';
import { CartProvider, useCart } from './context/CartContext.js';
import { Header } from './components/Header.js';
import { CartDrawer } from './components/CartDrawer.js';
import { CatalogPage } from './pages/CatalogPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderPaymentPage } from './pages/OrderPaymentPage.js';

type PageView = 'catalog' | 'checkout' | 'payment';

const AppContent: React.FC = () => {
  const { setIsCartOpen } = useCart();
  const [currentView, setCurrentView] = useState<PageView>('catalog');
  const [activeOrderToken, setActiveOrderToken] = useState<string | null>(null);

  const handleProceedToCheckout = () => {
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderCreated = (orderToken: string) => {
    setActiveOrderToken(orderToken);
    setCurrentView('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCatalog = () => {
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0]">
      <Header onCartClick={() => setIsCartOpen(true)} />

      <main className="flex-1">
        {currentView === 'catalog' && (
          <CatalogPage onNavigateToCheckout={handleProceedToCheckout} />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onBack={handleBackToCatalog}
            onOrderCreated={handleOrderCreated}
          />
        )}

        {currentView === 'payment' && activeOrderToken && (
          <OrderPaymentPage
            orderToken={activeOrderToken}
            onBackToHome={handleBackToCatalog}
          />
        )}
      </main>

      <CartDrawer onProceedToCheckout={handleProceedToCheckout} />

      {/* Footer */}
      <footer className="border-t border-amber-900/10 py-6 px-4 text-center text-xs text-amber-900/60 safe-bottom">
        <div className="max-w-4xl mx-auto space-y-1">
          <p className="font-serif font-bold text-amber-950">Dizz Baked Goods Studio</p>
          <p>Handcrafted Artisan Sourdoughs & Enriched Pastries</p>
          <p className="text-[11px] text-stone-400">
            Kebayoran Baru, Jakarta Selatan • WhatsApp Pre-Orders
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
