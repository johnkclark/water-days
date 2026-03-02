import { createClient } from '@supabase/supabase-js';

// Use placeholder values at build time to avoid crashing during prerender.
// The real values are injected via NEXT_PUBLIC_ env vars at runtime.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SwimLog = {
  id: string;
  date: string; // YYYY-MM-DD
  category: 'pool' | 'ocean' | 'lake_river' | 'other';
  note: string | null;
  created_at: string;
  updated_at: string;
};
