// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  import.meta.env.PUBLIC_SUPABASE_URL || 
  process.env.PUBLIC_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL || 
  process.env.SUPABASE_URL;

const supabaseAnonKey = 
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 
  process.env.PUBLIC_SUPABASE_ANON_KEY || 
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('⚠️ SUPABASE URL NO DEFINIDA O VACÍA');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');