import { createClient } from "@supabase/supabase-js";

// These two values are safe to live in the code:
// the publishable (anon) key is designed for browser apps, and your
// database is protected by Row Level Security rules, not by this key.
const SUPABASE_URL = "https://chwqahelrqwulbiijwfu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_W2D9WbyokjjR0I89XPh4DQ_DfFpGFRE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
