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

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  isMongoAtlas: true,
  name: isSupabaseConfigured 
    ? 'Supabase Cloud (Live)' 
    : 'MongoDB Atlas / Demo Mode',
  description: isSupabaseConfigured
    ? 'Connected to live Supabase backend with Row Level Security.'
    : 'Connected to MongoDB Atlas REST Backend (with local fallback).',
  supabaseUrl: isSupabaseConfigured ? supabaseUrl : null,
  apiUrl: apiUrl
};

