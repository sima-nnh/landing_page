import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

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
