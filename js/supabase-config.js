const SUPABASE_URL = "https://vpdgphvxzqatgzihibzy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ubGpcR1krIpaiDGtUmerdA__CH3H8kn";

// Initialize the Supabase client
const { createClient } = window.supabase;
window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
