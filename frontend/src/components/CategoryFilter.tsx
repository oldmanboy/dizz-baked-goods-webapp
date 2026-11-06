import React from 'react';

interface CategoryFilterProps {
  categories: Array<{ id: string; name: string }>;
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelectCategory('all')}
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
          selectedCategory === 'all'
            ? 'bg-amber-900 text-white shadow-sm'
            : 'bg-white/70 hover:bg-white text-stone-700 border border-amber-900/10'
        }`}
      >
        All Bakes
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === cat.id
              ? 'bg-amber-900 text-white shadow-sm'
              : 'bg-white/70 hover:bg-white text-stone-700 border border-amber-900/10'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};
