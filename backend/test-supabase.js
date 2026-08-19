import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jfpqrwwlfugmcaxsrzec.supabase.co';
const supabaseKey = 'sb_publishable_Np3mtA0OxxsOe8IM_qz9Pw_Ol64nCvS';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing Supabase REST Client connection...');
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.log('Supabase REST error:', error.message);
  } else {
    console.log('Supabase REST success! Data:', data);
  }
}

test();
