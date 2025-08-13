// Import the MetadataRoute type for type safety.
import { MetadataRoute } from 'next';

// This function generates the robots.txt file.
// robots.txt tells search engine crawlers which pages or files they can or can't request from your site.
export default function robots(): MetadataRoute.Robots {
  const siteUrl = 'https://www.linkuphub.com'; // Replace with your actual domain

  return {
    // Define the rules for all crawlers (user-agent: '*').
    rules: [
      {
        userAgent: '*',
        // Allow crawlers to access all pages by default.
        allow: '/',
        // Explicitly disallow crawlers from accessing private/sensitive areas.
        // This prevents them from indexing login pages, user dashboards, and API routes.
        disallow: [
            '/dashboard/', // Disallow all routes under /dashboard
            '/admin/',     // Disallow all routes under /admin
            '/login',
            '/signup',
            '/api/',       // Disallow all API routes
        ],
      },
    ],
    // Specify the location of your sitemap.xml file.
    // This helps crawlers discover all the pages you want them to index.
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}