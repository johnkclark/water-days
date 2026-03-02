'use client';

import { CATEGORIES, CATEGORY_KEYS, type CategoryKey } from '@/lib/constants';

type CategoryButtonsProps = {
  selectedCategory: CategoryKey | null;
  onSelect: (category: CategoryKey) => void;
  disabled?: boolean;
};

export default function CategoryButtons({
  selectedCategory,
  onSelect,
  disabled = false,
}: CategoryButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {CATEGORY_KEYS.map((key) => {
        const cat = CATEGORIES[key];
        const isSelected = selectedCategory === key;

        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            disabled={disabled}
            className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-6 transition-all duration-150 active:scale-95 disabled:opacity-50 ${
              isSelected
                ? 'border-current shadow-md'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
            }`}
            style={
              isSelected
                ? {
                    color: cat.color,
                    backgroundColor: `${cat.color}10`,
                    borderColor: cat.color,
                  }
                : undefined
            }
          >
            <span className="text-4xl" role="img" aria-label={cat.label}>
              {cat.emoji}
            </span>
            <span
              className={`text-sm font-semibold ${
                isSelected
                  ? ''
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {cat.label}
            </span>

            {/* Checkmark overlay when selected */}
            {isSelected && (
              <div className="animate-checkmark absolute right-2 top-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <circle cx="10" cy="10" r="10" fill={cat.color} />
                  <path
                    d="M6 10l3 3 5-6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
