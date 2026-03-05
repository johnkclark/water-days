'use client';

import { useState } from 'react';
import { TOTAL_SEASON_DAYS, deriveGoalRepresentations } from '@/lib/constants';

type GoalEditorProps = {
  currentTargetDays: number;
  onSave: (targetDays: number) => void;
  onCancel: () => void;
};

const PRESETS = [
  { label: '2/wk', days: Math.round((TOTAL_SEASON_DAYS / 7) * 2) },  // 77
  { label: '3/wk', days: Math.round((TOTAL_SEASON_DAYS / 7) * 3) },  // 115
  { label: '50%', days: 134 },
  { label: '4/wk', days: Math.round((TOTAL_SEASON_DAYS / 7) * 4) },  // 153
  { label: '5/wk', days: Math.round((TOTAL_SEASON_DAYS / 7) * 5) },  // 192
];

export default function GoalEditor({ currentTargetDays, onSave, onCancel }: GoalEditorProps) {
  const [value, setValue] = useState(currentTargetDays);
  const { targetPercentage, targetDaysPerWeek } = deriveGoalRepresentations(value);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Editor panel */}
      <div
        className="relative w-full max-w-lg animate-fade-in rounded-t-3xl bg-white px-6 pt-6 pb-10 shadow-xl dark:bg-slate-800"
        style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Set Your Goal
          </h2>
          <button
            onClick={onCancel}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        {/* Three-value display */}
        <div className="mb-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {value}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              days of {TOTAL_SEASON_DAYS}
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold tabular-nums text-water-500">
              {(targetPercentage * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              of season
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {targetDaysPerWeek.toFixed(1)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              days / week
            </p>
          </div>
        </div>

        {/* Slider */}
        <div className="mb-6 px-1">
          <input
            type="range"
            min={1}
            max={TOTAL_SEASON_DAYS}
            step={1}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="goal-slider"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-400 dark:text-slate-500">
            <span>1</span>
            <span>{TOTAL_SEASON_DAYS}</span>
          </div>
        </div>

        {/* Presets */}
        <div className="mb-6 flex gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setValue(preset.days)}
              className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
                value === preset.days
                  ? 'bg-water-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Save button */}
        <button
          onClick={() => onSave(value)}
          className="w-full rounded-xl bg-water-500 py-3 text-base font-semibold text-white transition-colors hover:bg-water-600 active:bg-water-700"
        >
          Save Goal
        </button>
      </div>
    </div>
  );
}
