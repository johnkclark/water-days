'use client';

import { useState, useEffect } from 'react';
import LogEntry from '@/components/LogEntry';
import { supabase, type SwimLog } from '@/lib/supabase';

export default function HistoryPage() {
  const [logs, setLogs] = useState<SwimLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase
        .from('swim_logs')
        .select('*')
        .order('date', { ascending: false });

      setLogs((data as SwimLog[]) || []);
      setIsLoading(false);
    }

    fetchLogs();
  }, []);

  const handleDelete = async (id: string) => {
    // Optimistic delete
    setLogs((prev) => prev.filter((l) => l.id !== id));

    const { error } = await supabase
      .from('swim_logs')
      .delete()
      .eq('id', id);

    if (error) {
      // Refetch on error
      const { data } = await supabase
        .from('swim_logs')
        .select('*')
        .order('date', { ascending: false });
      setLogs((data as SwimLog[]) || []);
    }
  };

  return (
    <div className="animate-fade-in mx-auto max-w-lg px-4 pt-4 pb-8">
      <h1 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
        History
      </h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-4xl">🏊</p>
          <p className="mt-3 text-lg font-medium text-slate-600 dark:text-slate-400">
            No swims logged yet
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
            Head to the Log tab to record your first swim!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <LogEntry key={log.id} log={log} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
