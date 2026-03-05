'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DateSelector from '@/components/DateSelector';
import CategoryButtons from '@/components/CategoryButtons';
import { type SwimLog } from '@/lib/supabase';
import { type CategoryKey } from '@/lib/constants';
import { getToday, isInSeason } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';

function QuickLogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, userId, supabase, isLoading: authLoading } = useAuth();
  const dateParam = searchParams.get('date');
  const initialDate = dateParam && isInSeason(dateParam) ? dateParam : getToday();

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [existingLog, setExistingLog] = useState<SwimLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [note, setNote] = useState('');
  const [noteExpanded, setNoteExpanded] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // Fetch existing log for selected date
  const fetchLog = useCallback(async (date: string) => {
    if (!userId) return;
    setIsLoading(true);
    setConfirmDelete(false);
    const { data } = await supabase
      .from('swim_logs')
      .select('*')
      .eq('date', date)
      .eq('user_id', userId)
      .maybeSingle();

    setExistingLog(data as SwimLog | null);
    setNote(data?.note || '');
    setNoteExpanded(!!data?.note);
    setIsLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    if (userId) {
      fetchLog(selectedDate);
    }
  }, [selectedDate, fetchLog, userId]);

  // Handle category selection — optimistic upsert
  const handleCategorySelect = async (category: CategoryKey) => {
    if (isSaving || !userId) return;
    setIsSaving(true);

    // Optimistic update
    const optimisticLog: SwimLog = {
      id: existingLog?.id || 'temp',
      date: selectedDate,
      category,
      note: note || null,
      created_at: existingLog?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setExistingLog(optimisticLog);

    // Show saved animation
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 1500);

    // Persist to Supabase
    const { data, error } = await supabase
      .from('swim_logs')
      .upsert(
        { date: selectedDate, category, note: note || null, user_id: userId },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();

    if (error) {
      // Revert on error
      await fetchLog(selectedDate);
      setShowSaved(false);
    } else {
      setExistingLog(data as SwimLog);
    }

    setIsSaving(false);
  };

  // Handle note save (blur or explicit)
  const handleNoteSave = async () => {
    if (!existingLog || existingLog.id === 'temp') return;

    await supabase
      .from('swim_logs')
      .update({ note: note || null })
      .eq('id', existingLog.id);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }

    if (!existingLog || existingLog.id === 'temp') return;

    // Optimistic delete
    const logToRestore = existingLog;
    setExistingLog(null);
    setNote('');
    setNoteExpanded(false);
    setConfirmDelete(false);

    const { error } = await supabase
      .from('swim_logs')
      .delete()
      .eq('id', logToRestore.id);

    if (error) {
      // Revert on error
      setExistingLog(logToRestore);
      setNote(logToRestore.note || '');
    }
  };

  // Show loading while auth is resolving
  if (authLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-water-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-lg px-4 pt-2">
      {/* Header */}
      <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-slate-100">
        Water Days
      </h1>

      {/* Date Selector */}
      <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Status indicator */}
      {!isLoading && (
        <div className="mb-4 text-center">
          {existingLog ? (
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="7" fill="currentColor" opacity="0.2" />
                  <path d="M4 7l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Logged
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Tap to change
              </span>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              How did you get in the water?
            </p>
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-3 px-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      )}

      {/* Category buttons */}
      {!isLoading && (
        <CategoryButtons
          selectedCategory={existingLog?.category || null}
          onSelect={handleCategorySelect}
          disabled={isSaving}
        />
      )}

      {/* Saved confirmation toast */}
      {showSaved && (
        <div className="animate-checkmark mt-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-water-50 px-4 py-2 text-sm font-medium text-water-700 dark:bg-water-900/30 dark:text-water-300">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 8l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Saved!
          </span>
        </div>
      )}

      {/* Note field */}
      {!isLoading && (
        <div className="mt-6 px-4">
          {!noteExpanded ? (
            <button
              onClick={() => setNoteExpanded(true)}
              className="w-full rounded-xl border border-dashed border-slate-300 px-4 py-3 text-left text-sm text-slate-400 transition-colors hover:border-slate-400 hover:text-slate-500 dark:border-slate-700 dark:text-slate-500 dark:hover:border-slate-600"
            >
              Add a note... (optional)
            </button>
          ) : (
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={handleNoteSave}
              placeholder="Any notes? (optional)"
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-water-500 focus:outline-none focus:ring-1 focus:ring-water-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
              autoFocus
            />
          )}
        </div>
      )}

      {/* Delete button */}
      {!isLoading && existingLog && existingLog.id !== 'temp' && (
        <div className="mt-4 px-4">
          <button
            onClick={handleDelete}
            className={`w-full rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              confirmDelete
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
            }`}
          >
            {confirmDelete ? 'Tap again to confirm delete' : 'Delete this entry'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 pt-2">
          <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-slate-100">
            Water Days
          </h1>
          <div className="mt-8 grid grid-cols-2 gap-3 px-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        </div>
      }
    >
      <QuickLogContent />
    </Suspense>
  );
}
