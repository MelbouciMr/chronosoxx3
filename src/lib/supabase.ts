import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side (anon key)
export const supabase = createClient(url, anonKey);

// Server-side (service role — never expose to browser)
export const supabaseAdmin = createClient(url, serviceKey);
