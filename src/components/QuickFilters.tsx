"use client";

import { QUICK_FILTERS, type QuickFilterId } from "@/lib/deals/filters";

interface QuickFiltersProps {
  active: ReadonlySet<QuickFilterId>;
  onToggle: (id: QuickFilterId) => void;
}

export function QuickFilters({ active, onToggle }: QuickFiltersProps) {
  return (
    <div
      role="group"
      aria-label="ตัวกรองด่วน"
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4"
    >
      {QUICK_FILTERS.map((filter) => {
        const selected = active.has(filter.id);
        return (
          <button
            key={filter.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onToggle(filter.id)}
            className={`h-10 shrink-0 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors ${
              selected
                ? "border-gold-400 bg-gold-400 text-cabinet-950"
                : "border-cabinet-600 bg-cabinet-800 text-cream hover:border-gold-400/60"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
