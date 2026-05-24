import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function assertSupabaseConfigured() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para ativar o Supabase.');
  }
}
