
import { createClient } from '@supabase/supabase-js';

// These will be environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Backend features will be unavailable.');
}

// Create a mock client when Supabase is not configured
const createMockClient = () => ({
  functions: {
    invoke: async () => ({ 
      data: { response: "Demo mode: Please connect to Supabase for full functionality." }, 
      error: null 
    })
  }
});

// Only create real Supabase client if we have valid configuration
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient() as any;
