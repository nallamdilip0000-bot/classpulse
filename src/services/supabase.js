/**
 * Supabase Client Configuration & Mode Detection
 * 
 * ClassPulse dual-mode architecture:
 * 1. DEMO MODE (Default): Uses LocalStorage persistence and realistic synthetic records.
 *    Clearly indicated in the top navigation bar. No external network requests required.
 * 2. PRODUCTION MODE: Activated when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are provided.
 *    Connects to Supabase with Row Level Security (RLS) enforcement.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key'
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const backendMode = {
  isDemo: !isSupabaseConfigured,
  name: isSupabaseConfigured ? 'Supabase Cloud (Live)' : 'Demo Mode (Local Persistence)',
  description: isSupabaseConfigured
    ? 'Connected to live Supabase backend with Row Level Security.'
    : 'Running locally in demo mode with synthetic data and browser persistence.',
  supabaseUrl: isSupabaseConfigured ? supabaseUrl : null
};
