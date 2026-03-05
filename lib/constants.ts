export const SEASON_START = '2026-02-25';
export const SEASON_END = '2026-11-19';
export const TOTAL_SEASON_DAYS = 268;
export const SEASON_WEEKS = TOTAL_SEASON_DAYS / 7; // ~38.29

// Defaults for users who haven't set a custom goal
export const DEFAULT_TARGET_DAYS = 134;
export const DEFAULT_TARGET_PERCENTAGE = 0.50;

/** Derive all goal representations from a target_days value */
export function deriveGoalRepresentations(targetDays: number) {
  return {
    targetDays,
    targetPercentage: targetDays / TOTAL_SEASON_DAYS,
    targetDaysPerWeek: targetDays / SEASON_WEEKS,
  };
}

export type CategoryKey = 'pool' | 'ocean' | 'lake_river' | 'other';

export const CATEGORIES: Record<
  CategoryKey,
  { label: string; emoji: string; color: string }
> = {
  pool: { label: 'Pool', emoji: '🏊', color: '#3B82F6' },
  ocean: { label: 'Ocean', emoji: '🌊', color: '#0EA5E9' },
  lake_river: { label: 'Lake / River', emoji: '🏞️', color: '#14B8A6' },
  other: { label: 'Other', emoji: '📍', color: '#8B5CF6' },
} as const;

export const CATEGORY_KEYS: CategoryKey[] = ['pool', 'ocean', 'lake_river', 'other'];
