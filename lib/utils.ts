import {
  SEASON_START,
  SEASON_END,
  TOTAL_SEASON_DAYS,
  TARGET_PERCENTAGE,
} from './constants';
import type { SwimLog } from './supabase';

/** Parse YYYY-MM-DD string to Date at UTC noon (avoids DST edge cases) */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

/** Format Date to YYYY-MM-DD string */
export function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Get today as YYYY-MM-DD in local timezone */
export function getToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Number of days between two YYYY-MM-DD strings (end - start) */
export function daysBetween(startStr: string, endStr: string): number {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/** Check if a YYYY-MM-DD date falls within the season (inclusive) */
export function isInSeason(dateStr: string): boolean {
  return dateStr >= SEASON_START && dateStr <= SEASON_END;
}

/** Format a YYYY-MM-DD date for display, e.g. "Sat, Mar 1" */
export function formatDateDisplay(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Format a YYYY-MM-DD date for long display, e.g. "Saturday, March 1, 2026" */
export function formatDateLong(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Add days to a YYYY-MM-DD string, returning a new YYYY-MM-DD string */
export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDate(date);
}

/** Get all months that overlap with the season */
export function getSeasonMonths(): { year: number; month: number; label: string }[] {
  const startDate = parseDate(SEASON_START);
  const endDate = parseDate(SEASON_END);
  const months: { year: number; month: number; label: string }[] = [];

  let current = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1, 12));
  const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1, 12));

  while (current <= end) {
    months.push({
      year: current.getUTCFullYear(),
      month: current.getUTCMonth(),
      label: current.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' }),
    });
    current.setUTCMonth(current.getUTCMonth() + 1);
  }

  return months;
}

/** Get all dates in a month as YYYY-MM-DD strings, filtered to season range */
export function getMonthDates(year: number, month: number): (string | null)[] {
  // Build a grid: 7 columns (Sun-Sat), cells are date strings or null (padding)
  const firstDay = new Date(Date.UTC(year, month, 1, 12));
  const startDow = firstDay.getUTCDay(); // 0=Sun

  const daysInMonth = new Date(Date.UTC(year, month + 1, 0, 12)).getUTCDate();

  const cells: (string | null)[] = [];

  // Leading padding
  for (let i = 0; i < startDow; i++) {
    cells.push(null);
  }

  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push(dateStr);
  }

  return cells;
}

export type SeasonStats = {
  totalSwims: number;
  daysElapsed: number;
  currentPercentage: number;
  expectedSwims: number;
  paceDelta: number;
  paceMessage: string;
  projectedTotal: number;
  currentStreak: number;
  longestStreak: number;
  seasonProgressPercent: number;
};

/** Calculate all dashboard statistics from swim logs */
export function calculateStats(logs: SwimLog[]): SeasonStats {
  const today = getToday();

  // Days elapsed: from season start to today (or season end if season is over)
  const effectiveEnd = today > SEASON_END ? SEASON_END : today;
  const daysElapsed = Math.max(0, Math.min(
    daysBetween(SEASON_START, effectiveEnd) + 1, // +1 because start day counts
    TOTAL_SEASON_DAYS
  ));

  const totalSwims = logs.length;

  // Current percentage
  const currentPercentage = daysElapsed > 0 ? totalSwims / daysElapsed : 0;

  // Expected swims by now
  const expectedSwims = daysElapsed * TARGET_PERCENTAGE;

  // Pace delta (positive = ahead)
  const paceDelta = Math.round(totalSwims - expectedSwims);

  // Pace message
  let paceMessage: string;
  if (paceDelta > 0) {
    paceMessage = `${paceDelta} day${paceDelta !== 1 ? 's' : ''} ahead of pace`;
  } else if (paceDelta < 0) {
    const behind = Math.abs(paceDelta);
    paceMessage = `${behind} day${behind !== 1 ? 's' : ''} behind pace`;
  } else {
    paceMessage = 'Right on track';
  }

  // Projected total
  const projectedTotal = daysElapsed > 0
    ? Math.round((totalSwims / daysElapsed) * TOTAL_SEASON_DAYS)
    : 0;

  // Season progress percentage
  const seasonProgressPercent = (daysElapsed / TOTAL_SEASON_DAYS) * 100;

  // Streaks - sort logs by date ascending
  const sortedDates = logs.map((l) => l.date).sort();

  let currentStreak = 0;
  let longestStreak = 0;

  if (sortedDates.length > 0) {
    // Calculate longest streak
    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      if (daysBetween(sortedDates[i - 1], sortedDates[i]) === 1) {
        streak++;
      } else {
        longestStreak = Math.max(longestStreak, streak);
        streak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, streak);

    // Calculate current streak (count backwards from today)
    const dateSet = new Set(sortedDates);
    let checkDate = today;
    // If today isn't logged, check yesterday (might still be on a streak)
    if (!dateSet.has(checkDate)) {
      checkDate = addDays(checkDate, -1);
    }
    while (dateSet.has(checkDate)) {
      currentStreak++;
      checkDate = addDays(checkDate, -1);
    }
  }

  return {
    totalSwims,
    daysElapsed,
    currentPercentage,
    expectedSwims,
    paceDelta,
    paceMessage,
    projectedTotal,
    currentStreak,
    longestStreak,
    seasonProgressPercent,
  };
}
