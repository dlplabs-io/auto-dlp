import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';


let supabase: SupabaseClient<Database>;


/**
 * Uses the Supabase client if it is already initialized, otherwise creates a new one.
 * @returns The Supabase client
 */
export const GetSupabaseClient = () => {
  if (supabase) return supabase;

  if (!process.env.SUPABASE_URL) {
    throw new Error('Missing SUPABASE_URL environment variable');
  }
  if (!process.env.SUPABASE_ANON_KEY) {
    throw new Error('Missing SUPABASE_ANON_KEY environment variable');
  }

  supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false
      }
    }
  );

  return supabase;
};