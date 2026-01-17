import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://saunsibblswdulijmejy.supabase.co';
const supabaseAnonKey = 'sb_publishable_vTEj6US2uUwf_FPCy8Z3Iw_LtQWvqw-';

// Helper function for timestamped logging
const log = (level: 'info' | 'error', message: string) => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 23);
  console.log(`${timestamp} [${level}] ${message}`);
};

// Initialize Supabase client only once
let supabaseInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    log('info', 'Handling CreateClient action');
    log('info', `Connecting to Supabase at ${supabaseUrl}`);
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    log('info', 'Supabase client created successfully');
  }
  return supabaseInstance;
}

export const supabase = getSupabaseClient();
