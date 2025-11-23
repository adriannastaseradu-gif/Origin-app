import { createClient } from '@supabase/supabase-js';

// Your Supabase configuration
const supabaseUrl = 'https://cuvdmuvnkllxtnwpaotx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1dmRtdXZua2xseHRud3Bhb3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NTgwMjMsImV4cCI6MjA3OTQzNDAyM30.QuQ_sLdm_CZEgk6MvU-TChukv0ho_WZmxUniwyYefFg';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

