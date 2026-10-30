import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Aviso: As variáveis de ambiente do Supabase não foram configuradas no arquivo .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
