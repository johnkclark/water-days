'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatsCards from '@/components/StatsCards';
import CalendarHeatmap from '@/components/CalendarHeatmap';
import GoalEditor from '@/components/GoalEditor';
import { type SwimLog, type UserGoal } from '@/lib/supabase';
import { SEASON_START, SEASON_END, DEFAULT_TARGET_DAYS, deriveGoalRepresentations } from '@/lib/constants';
import { calculateStats } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';

export default function DashboardPage() {
  const { user, userId, supabase, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<SwimLog[]>([]);
  const [targetDays, setTargetDays] = useState(DEFAULT_TARGET_DAYS);
  const [isLoading, setIsLoading] = useState(true);
  const [isGoalEditorOpen, setIsGoalEditorOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      const [logsResult, goalResult] = await Promise.all([
        supabase
          .from('swim_logs')
          .select('*')
          .eq('user_id', userId)
          .gte('date', SEASON_START)
          .lte('date', SEASON_END)
          .order('date', { ascending: true }),
        supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
      ]);

      setLogs((logsResult.data as SwimLog[]) || []);
      if (goalResult.data) {
        setTargetDays((goalResult.data as UserGoal).target_days);
      }
      setIsLoading(false);
    }

    fetchData();
  }, [userId, supabase]);

  const { targetPercentage } = deriveGoalRepresentations(targetDays);
  const stats = calculateStats(logs, targetPercentage);

  const handleGoalSave = async (newTargetDays: number) => {
    setTargetDays(newTargetDays);
    setIsGoalEditorOpen(false);

    await supabase
      .from('user_goals')
      .upsert(
        { user_id: userId, target_days: newTargetDays },
        { onConflict: 'user_id' }
      );
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-water-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-lg px-4 pt-4 pb-8">
      <h1 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
        Dashboard
      </h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <StatsCards
            stats={stats}
            targetDays={targetDays}
            onEditGoal={() => setIsGoalEditorOpen(true)}
          />
          <CalendarHeatmap logs={logs} />
        </div>
      )}

      {isGoalEditorOpen && (
        <GoalEditor
          currentTargetDays={targetDays}
          onSave={handleGoalSave}
          onCancel={() => setIsGoalEditorOpen(false)}
        />
      )}
    </div>
  );
}
