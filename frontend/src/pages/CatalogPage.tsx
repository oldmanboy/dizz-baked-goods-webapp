import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client.js';
import { PoBanner } from '../components/PoBanner.js';
import { CategoryFilter } from '../components/CategoryFilter.js';
import { ProductCard } from '../components/ProductCard.js';
import { useCart } from '../context/CartContext.js';
import { Loader2, AlertCircle } from 'lucide-react';

interface CatalogResponse {
  activeBatch: {
    batchId: string;
    title: string;
    description: string;
    orderCutoff: string;
    fulfillmentDates: Array<{ date: string; label: string }>;
  };
  categories: Array<{ id: string; name: string }>;
  products: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    image: string;
    allergens: string[];
    weightGrams: number;
    available: boolean;
  }>;
}

export const CatalogPage: React.FC<{ onNavigateToCheckout: () => void }> = () => {
  const { fulfillmentDate, setFulfillmentDate } = useCart();
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    let isMounted = true;
    apiFetch<CatalogResponse>('/api/v1/catalog')
      .then((data) => {
        if (isMounted) {
          setCatalog(data);
          // Auto-select first fulfillment date if not yet chosen
          if (!fulfillmentDate && data.activeBatch?.fulfillmentDates?.length > 0) {
            setFulfillmentDate(data.activeBatch.fulfillmentDates[0].date);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Could not load bakery catalog. Please check your connection.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 text-amber-800 animate-spin" />
        <p className="text-xs font-semibold text-amber-950">Warming up the oven...</p>
      </div>
    );
  }

  if (error || !catalog) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-red-200 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
        <h3 className="font-serif font-bold text-base text-stone-900">Failed to Load Catalog</h3>
        <p className="text-xs text-stone-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-amber-800 text-white text-xs font-bold shadow-xs hover:bg-amber-900"
        >
          Try Again
        </button>
      </div>
    );
  }

  const filteredProducts =
    selectedCategory === 'all'
      ? catalog.products
      : catalog.products.filter((p) => p.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 safe-bottom">
      {/* Active Pre-Order Batch Banner */}
      <PoBanner
        batchTitle={catalog.activeBatch.title}
        description={catalog.activeBatch.description}
        orderCutoff={catalog.activeBatch.orderCutoff}
        fulfillmentDates={catalog.activeBatch.fulfillmentDates}
        selectedDate={fulfillmentDate}
        onSelectDate={setFulfillmentDate}
      />

      {/* Bread Catalog Filter & Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-950">
              Weekend Bread Bakes
            </h2>
            <p className="text-xs text-stone-500">Baked in small batches with wild sourdough starters</p>
          </div>
        </div>

        <CategoryFilter
          categories={catalog.categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};
