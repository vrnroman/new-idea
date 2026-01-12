import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  // In a real app we might throw, but for build time we might want to be lenient
  // console.warn('Supabase credentials missing');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
