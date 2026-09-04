/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xozxnlzxfzoqpdxmjahj.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_NnpSl0nm6AayGdenpJbmiQ__VN1kq4C';

export const supabase = createClient(supabaseUrl, supabaseKey);
