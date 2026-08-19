import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jfpqrwwlfugmcaxsrzec.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Np3mtA0OxxsOe8IM_qz9Pw_Ol64nCvS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
