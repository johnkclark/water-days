'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, type CategoryKey } from '@/lib/constants';
import { formatDateDisplay } from '@/lib/utils';
import type { SwimLog } from '@/lib/supabase';

type LogEntryProps = {
  log: SwimLog;
  onDelete: (id: string) => void;
};

export default function LogEntry({ log, onDelete }: LogEntryProps) {
  const router = useRouter();
  const [noteExpanded, setNoteExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const cat = CATEGORIES[log.category as CategoryKey];

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    onDelete(log.id);
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <div className="flex items-center gap-3">
        {/* Category icon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
          style={{ backgroundColor: `${cat.color}20` }}
        >
          {cat.emoji}
        </div>

        {/* Date and category */}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            {formatDateDisplay(log.date)}
          </p>
          <p className="text-sm" style={{ color: cat.color }}>
            {cat.label}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(`/?date=${log.date}`)}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            title="Edit"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11.5 1.5l3 3L5 14H2v-3z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className={`rounded-lg p-2 transition-colors ${
              confirmDelete
                ? 'bg-red-500 text-white'
                : 'text-slate-400 hover:bg-red-50 hover:text-red-500 dark:text-slate-500 dark:hover:bg-red-900/20 dark:hover:text-red-400'
            }`}
            title={confirmDelete ? 'Confirm delete' : 'Delete'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3,4 13,4" />
              <path d="M6 4V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V4" />
              <path d="M4 4l.8 9.6a1 1 0 0 0 1 .9h4.4a1 1 0 0 0 1-.9L12 4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Note */}
      {log.note && (
        <div className="mt-2 pl-13">
          <button
            onClick={() => setNoteExpanded(!noteExpanded)}
            className="text-left text-sm text-slate-600 dark:text-slate-400"
          >
            <p className={noteExpanded ? '' : 'line-clamp-2'}>
              {log.note}
            </p>
            {log.note.length > 100 && (
              <span className="text-xs font-medium text-water-500">
                {noteExpanded ? 'Show less' : 'Show more'}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
