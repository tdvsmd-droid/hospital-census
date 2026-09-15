import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase credentials from your dashboard
const SUPABASE_URL = 'https://spkjnzptrqrdfqizuhrv.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_Kx048-tmM-FMVfoxMSswwg_OOypiqge'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)