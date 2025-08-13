// Import the MetadataRoute type from Next.js for type safety.
import { MetadataRoute } from 'next';
// Import our server-side Supabase client to fetch data.
import { createSupabaseServerClient } from '@/lib/supabase/server';

// This function will be executed at build time to generate the sitemap.xml file.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Initialize the Supabase client.
  const supabase = createSupabaseServerClient();
  const siteUrl = 'https://www.linkuphub.com'; // Replace with your actual domain

  // --- Fetch dynamic routes from the database ---
  // We need to get all public-facing event pages to include them in the sitemap.
  const { data: events, error } = await supabase
    .from('events')
    .select('id, updated_at') // Select id for the URL and updated_at for the lastModified date
    .order('created_at', { ascending: false });

  if(error) {
    console.error("Error fetching events for sitemap:", error);
    return []; // Return empty sitemap on error
  }

  // Map the fetched event data into the format required by Next.js sitemap.
  const eventUrls = events?.map((event) => ({
    url: `${siteUrl}/events/${event.id}`,
    lastModified: new Date(event.updated_at).toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) ?? []; // Use an empty array as a fallback if events is null.

  // --- Define static routes ---
  // These are the main pages of your site that don't change often.
  const staticUrls = [
    {
      url: siteUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 1.0,
    },
    {
      url: `${siteUrl}/about`, // Assuming you have an 'about' page
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    // Add other static pages here (e.g., /contact, /blog)
  ];

  // Combine the static and dynamic URLs into a single sitemap array.
  return [...staticUrls, ...eventUrls];
}