// Import the createClient function from the Supabase JS library.
import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and Service Role Key from environment variables.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if the required environment variables are set.
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL and Service Role Key must be defined in your .env file');
}

// Create and export a single, reusable Supabase client instance.
// Using the SERVICE_ROLE_KEY gives this client admin-level privileges,
// allowing it to bypass Row Level Security (RLS) policies.
// This is essential for backend operations like creating users, managing data, etc.
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
