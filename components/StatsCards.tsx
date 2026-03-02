'use client';

import { TARGET_SWIM_DAYS, TOTAL_SEASON_DAYS } from '@/lib/constants';
import type { SeasonStats } from '@/lib/utils';

type StatsCardsProps = {
  stats: SeasonStats;
};

export default function StatsCards({ stats }: StatsCardsProps) {
  const {
    totalSwims,
    daysElapsed,
    currentPercentage,
    paceDelta,
    paceMessage,
    projectedTotal,
    currentStreak,
    longestStreak,
    seasonProgressPercent,
  } = stats;

  const paceColor =
    paceDelta > 0
      ? 'text-green-600 dark:text-green-400'
      : paceDelta < 0
        ? 'text-red-500 dark:text-red-400'
        : 'text-amber-500 dark:text-amber-400';

  const paceBgColor =
    paceDelta > 0
      ? 'bg-green-50 dark:bg-green-900/20'
      : paceDelta < 0
        ? 'bg-red-50 dark:bg-red-900/20'
        : 'bg-amber-50 dark:bg-amber-900/20';

  return (
    <div className="space-y-3">
      {/* Season Progress */}
      <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-600 dark:text-slate-400">
            Season Progress
          </span>
          <span className="tabular-nums text-slate-500 dark:text-slate-400">
            Day {daysElapsed} of {TOTAL_SEASON_DAYS}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
          <div
            className="animate-fill h-full rounded-full bg-gradient-to-r from-water-300 to-water-500"
            style={{ width: `${Math.min(seasonProgressPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Swim Count + Percentage */}
      <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-4xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {totalSwims}
            </span>
            <span className="ml-2 text-lg text-slate-500 dark:text-slate-400">
              swim{totalSwims !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold tabular-nums text-water-500">
              {(currentPercentage * 100).toFixed(0)}%
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              of days elapsed
            </p>
          </div>
        </div>
      </div>

      {/* Pace vs Target */}
      <div className={`rounded-2xl p-4 shadow-sm ${paceBgColor}`}>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${paceColor}`}>
            {paceDelta > 0 ? '↑' : paceDelta < 0 ? '↓' : '→'}
          </span>
          <span className={`text-lg font-semibold ${paceColor}`}>
            {paceMessage}
          </span>
        </div>
        {paceDelta < 0 && daysElapsed > 0 && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Need {Math.ceil((TARGET_SWIM_DAYS - totalSwims) / ((TOTAL_SEASON_DAYS - daysElapsed) || 1) * 5)} of next 5 days to get back on track
          </p>
        )}
      </div>

      {/* Projected Finish + Streaks */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Projected
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {projectedTotal}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            of {TARGET_SWIM_DAYS} target
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Streak
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {currentStreak}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            day{currentStreak !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Best
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {longestStreak}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            day{longestStreak !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
