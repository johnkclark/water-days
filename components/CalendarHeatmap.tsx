'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, type CategoryKey } from '@/lib/constants';
import { getSeasonMonths, getMonthDates, getToday, isInSeason } from '@/lib/utils';
import type { SwimLog } from '@/lib/supabase';

type CalendarHeatmapProps = {
  logs: SwimLog[];
};

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarHeatmap({ logs }: CalendarHeatmapProps) {
  const router = useRouter();
  const today = getToday();
  const months = getSeasonMonths();

  // Build a lookup map: date string -> SwimLog
  const logMap = useMemo(() => {
    const map = new Map<string, SwimLog>();
    for (const log of logs) {
      map.set(log.date, log);
    }
    return map;
  }, [logs]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
        Calendar
      </h2>

      {months.map(({ year, month, label }) => {
        const cells = getMonthDates(year, month);

        return (
          <div key={`${year}-${month}`}>
            <h3 className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
              {label} {year}
            </h3>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAY_LABELS.map((day, i) => (
                <div
                  key={i}
                  className="text-center text-[10px] font-medium text-slate-400 dark:text-slate-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((dateStr, i) => {
                if (!dateStr) {
                  return <div key={`pad-${i}`} className="aspect-square" />;
                }

                const inSeason = isInSeason(dateStr);
                const log = logMap.get(dateStr);
                const isToday = dateStr === today;
                const isFuture = dateStr > today;
                const dayNum = parseInt(dateStr.split('-')[2], 10);

                let bgColor = '';
                let textColor = 'text-slate-400 dark:text-slate-500';

                if (log) {
                  const cat = CATEGORIES[log.category as CategoryKey];
                  bgColor = cat.color;
                  textColor = 'text-white';
                } else if (!inSeason) {
                  bgColor = 'transparent';
                  textColor = 'text-slate-300 dark:text-slate-700';
                } else if (isFuture) {
                  bgColor = '';
                  textColor = 'text-slate-300 dark:text-slate-600';
                } else {
                  // Past day, no log
                  bgColor = '';
                  textColor = 'text-slate-500 dark:text-slate-400';
                }

                return (
                  <button
                    key={dateStr}
                    onClick={() => router.push(`/?date=${dateStr}`)}
                    disabled={!inSeason}
                    className={`aspect-square flex items-center justify-center rounded-sm text-[11px] font-medium transition-all ${textColor} ${
                      isToday ? 'ring-2 ring-water-500 ring-offset-1 dark:ring-offset-slate-900' : ''
                    } ${
                      inSeason && !log && !isFuture
                        ? 'bg-slate-100 dark:bg-slate-800'
                        : !log && isFuture && inSeason
                          ? 'bg-slate-50 dark:bg-slate-800/50'
                          : ''
                    } ${inSeason ? 'hover:opacity-80' : 'cursor-default'}`}
                    style={log ? { backgroundColor: bgColor } : undefined}
                    title={dateStr}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {cat.label}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Rest day
          </span>
        </div>
      </div>
    </div>
  );
}
