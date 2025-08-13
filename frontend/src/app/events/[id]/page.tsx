import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type Props = {
  params: { id: string }
}

// Generates dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const { data: event } = await supabase
    .from('events')
    .select('title, description, poster_url')
    .eq('id', params.id)
    .single();

  if (!event) {
    return {
      title: 'Event Not Found',
    }
  }

  return {
    title: `${event.title} | Link Up Hub`,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: [
        {
          url: event.poster_url || '/default-og-image.png',
          width: 1200,
          height: 630,
        },
      ],
    },
    // JSON-LD Structured Data for Rich Snippets in Google
    alternates: {
      canonical: `/events/${params.id}`,
    },
  }
}

export default async function EventDetailPage({ params }: Props) {
  const supabase = createSupabaseServerClient();
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!event) {
    notFound();
  }

  return (
    <main className="container mx-auto p-4 bg-brand-bg text-brand-primary">
      {/* Structured data for Google Events */}
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            "name": event.title,
            "startDate": event.event_date,
            "description": event.description,
            "image": event.poster_url,
            "location": {
              "@type": "Place",
              "name": event.location
            },
            "offers": {
              "@type": "Offer",
              "price": event.price,
              "priceCurrency": "KES",
              "url": `https://linkuphub.com/events/${event.id}`,
              "availability": "https://schema.org/InStock"
            }
        })}}
      />
      <h1 className="text-4xl font-bold">{event.title}</h1>
      <img src={event.poster_url} alt={event.title} className="my-4 rounded-lg shadow-lg" />
      <p>{event.description}</p>
      {/* ... Add RSVP button and other details here ... */}
    </main>
  );
}