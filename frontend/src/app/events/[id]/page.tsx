// Import necessary components and the server-side Supabase client.
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation'; // Import the notFound function

// Define a type for our event object for TypeScript safety.
type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  poster_url?: string;
  is_free: boolean;
  price: number;
};

// This is the page component, which is a Server Component.
// The 'getEvent' helper function is no longer needed.
export default async function EventDetailPage({ params }: { params: { id: string } }) {
  // 1. Create a Supabase client instance designed for server-side rendering.
  const supabase = createSupabaseServerClient();

  // 2. Fetch the specific event directly from the database using its ID.
  // This is much faster than making an HTTP request to our own API.
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id) // Filter by the ID from the URL.
    .single(); // We expect only one event.

  // 3. If the event is not found or there's an error, render the notFound() UI.
  // This is the standard Next.js way to handle 404 pages in dynamic routes.
  if (error || !event) {
    notFound();
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Left Side: Image */}
        <div>
          <img
            src={event.poster_url || 'https://via.placeholder.com/800x600.png?text=Event+Poster'}
            alt={event.title}
            className="w-full h-auto object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Right Side: Details */}
        <div className="flex flex-col space-y-6">
          <h1 className="text-4xl font-extrabold text-brand-primary">{event.title}</h1>

          <div className="flex items-center text-gray-600">
            <Calendar className="mr-2 h-5 w-5" />
            <span>{new Date(event.event_date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <MapPin className="mr-2 h-5 w-5" />
            <span>{event.location}</span>
          </div>
          
          <div className="prose max-w-none text-gray-800">
            <p>{event.description}</p>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center text-2xl font-bold text-brand-accent">
              <Ticket className="mr-3 h-8 w-8" />
              <span>{event.is_free ? 'Free Entry' : `Ksh ${event.price}`}</span>
            </div>
          </div>
          
          <Button size="lg" className="w-full bg-brand-accent hover:bg-blue-700">
            {event.is_free ? 'RSVP Now' : 'Buy Ticket'}
          </Button>
        </div>
      </div>
    </div>
  );
}