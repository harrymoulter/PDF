import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tgephxyefeqzamuqbgct.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZXBoeHllZmVxemFtdXFiZ2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMzQwNDEsImV4cCI6MjA5MjkxMDA0MX0.Ga_HzT0wloMivYVSkPMOcPFyMyle7gB-DPmXZXpNpfA';

// Normalize URL: Use native URL constructor to ensure we only have the base protocol + host
if (supabaseUrl) {
  try {
    const parsedUrl = new URL(supabaseUrl);
    supabaseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
    
    // Safety check: sometimes users provide the project reference instead of the full URL
    if (!supabaseUrl.includes('.') && !supabaseUrl.includes('localhost')) {
      supabaseUrl = `https://${supabaseUrl}.supabase.co`;
    }
  } catch (e) {
    // Fallback if URL is invalid but has characters, just trim it
    supabaseUrl = supabaseUrl.trim().replace(/\/+$/, '');
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Auth features will not work.');
}

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
