'use client';

import { useRef } from 'react';
import { SEASON_START, SEASON_END } from '@/lib/constants';
import { formatDateDisplay, getToday, addDays, isInSeason } from '@/lib/utils';

type DateSelectorProps = {
  selectedDate: string;
  onDateChange: (date: string) => void;
};

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const today = getToday();
  const isToday = selectedDate === today;

  const canGoBack = addDays(selectedDate, -1) >= SEASON_START;
  const canGoForward = addDays(selectedDate, 1) <= SEASON_END;

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <button
        onClick={() => canGoBack && onDateChange(addDays(selectedDate, -1))}
        disabled={!canGoBack}
        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Previous day"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="12,4 6,10 12,16" />
        </svg>
      </button>

      <button
        onClick={() => inputRef.current?.showPicker()}
        className="flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {formatDateDisplay(selectedDate)}
        </span>
        {isToday && (
          <span className="text-xs font-medium text-water-500">Today</span>
        )}
        {!isToday && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDateChange(today);
            }}
            className="text-xs font-medium text-water-500 hover:text-water-600"
          >
            Go to today
          </button>
        )}
      </button>

      <button
        onClick={() => canGoForward && onDateChange(addDays(selectedDate, 1))}
        disabled={!canGoForward}
        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Next day"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="8,4 14,10 8,16" />
        </svg>
      </button>

      {/* Hidden native date input — triggers OS date picker */}
      <input
        ref={inputRef}
        type="date"
        value={selectedDate}
        min={SEASON_START}
        max={SEASON_END}
        onChange={(e) => {
          if (e.target.value && isInSeason(e.target.value)) {
            onDateChange(e.target.value);
          }
        }}
        className="invisible absolute h-0 w-0"
        tabIndex={-1}
      />
    </div>
  );
}
