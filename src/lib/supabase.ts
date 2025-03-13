import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { ENV } from '@/config/env';

let supabase: SupabaseClient<Database>;

/**
 * Uses the Supabase client if it is already initialized, otherwise creates a new one.
 * @returns The Supabase client
 */
export const GetSupabaseClient = () => {
  if (supabase) return supabase;

  supabase = createClient<Database>(
    ENV.SUPABASE_URL,
    ENV.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false
      }
    }
  );

  return supabase;
};

export const ACCOUNTS_TABLE = 'accounts';
export const FILES_TABLE = 'files';
export const FILES_OLD_TABLE = 'files-old';
export const PROFILES_WALLET_TABLE = 'profiles_wallet';
