// Import the createServerClient function from the Supabase Server-Side Rendering library.
// This is specifically designed to work with server environments like Next.js.
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Import the 'cookies' function from Next.js headers. This function provides
// read-only access to the incoming request's cookies. It's a server-only API.
import { cookies } from 'next/headers';

// This function creates a Supabase client instance intended for use within
// Next.js Server Components, Server Actions, and Route Handlers.
export async function createSupabaseServerClient() {
  // Retrieve the cookie store from the incoming request.
  // Note: cookies() returns a Promise in some contexts, so we await it
  const cookieStore = await cookies();

  // --- ERROR FIX & BEST PRACTICE ---
  // Before creating the client, we MUST verify that the environment variables are available.
  // If they are not, we throw an immediate and informative error. This prevents runtime
  // crashes in production and makes debugging during development much easier.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and/or Anon Key are not defined in .env.local');
  }
  // --- END FIX ---

  // Return a new Supabase client instance.
  return createServerClient(
    // Pass the verified Supabase URL and Anon Key.
    supabaseUrl,
    supabaseAnonKey,
    {
      // The 'cookies' object tells the Supabase client how to interact with the Next.js cookie store.
      // This is essential for managing the user's authentication session across server-side requests.
      cookies: {
        // The 'get' function is used by the Supabase client to read a cookie's value.
        get(name: string) {
          // It uses the cookieStore from next/headers to look up the cookie by name.
          return cookieStore.get(name)?.value;
        },
        // The 'set' function is used to save or update a cookie (e.g., after login).
        set(name: string, value: string, options: CookieOptions) {
          try {
            // It uses the cookieStore's 'set' method, passing all required options.
            // This happens within Server Actions or Route Handlers.
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle potential errors in cookie setting (e.g., in middleware or edge functions)
            console.error(`Failed to set cookie ${name}:`, error);
          }
        },
        // The 'remove' function is used to delete a cookie (e.g., after logout).
        remove(name: string, options: CookieOptions) {
          try {
            // It achieves this by setting the cookie's value to an empty string with the same options.
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle potential errors in cookie removal
            console.error(`Failed to remove cookie ${name}:`, error);
          }
        },
      },
    }
  );
}

// Additional utility function for better error handling
export async function getSupabaseServerClient() {
  try {
    return await createSupabaseServerClient();
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    throw error;
  }
}