import React from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';

interface PoBannerProps {
  batchTitle: string;
  description: string;
  orderCutoff: string;
  fulfillmentDates: Array<{ date: string; label: string }>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const PoBanner: React.FC<PoBannerProps> = ({
  batchTitle,
  description,
  orderCutoff,
  fulfillmentDates,
  selectedDate,
  onSelectDate,
}) => {
  const cutoffFormatted = new Date(orderCutoff).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <section className="bg-gradient-to-br from-amber-900/10 via-amber-800/5 to-transparent rounded-2xl p-5 border border-amber-900/15 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-800/10 text-amber-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Open for Pre-Order</span>
          </div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-amber-950">
            {batchTitle}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl">
            {description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-amber-900/90 pt-1 border-t border-amber-900/10">
        <div className="flex items-center gap-1.5 font-medium">
          <Clock className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Cutoff: <strong className="text-amber-950">{cutoffFormatted} WIB</strong></span>
        </div>
      </div>

      {/* Date selector pills */}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-700" />
          <span>Select Your Bake Fulfillment Date:</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {fulfillmentDates.map((item) => {
            const isSelected = selectedDate === item.date;
            return (
              <button
                key={item.date}
                type="button"
                onClick={() => onSelectDate(item.date)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-amber-800 text-white border-amber-800 shadow-sm'
                    : 'bg-white/80 hover:bg-white text-stone-700 border-amber-900/15'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
