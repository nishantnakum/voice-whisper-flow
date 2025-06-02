
import { createClient } from '@supabase/supabase-js';

// These will be environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Backend features will be unavailable.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
