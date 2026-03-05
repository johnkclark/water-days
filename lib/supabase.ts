// Re-export the SSR-aware browser client as the default supabase client.
// This ensures data queries share the same auth session as sign-in.
export { createSupabaseBrowserClient } from './auth';

export type SwimLog = {
  id: string;
  date: string; // YYYY-MM-DD
  category: 'pool' | 'ocean' | 'lake_river' | 'other';
  note: string | null;
  created_at: string;
  updated_at: string;
};
