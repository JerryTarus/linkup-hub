// Import necessary components, the server-side Supabase client, and next/image.
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image'; // --- FIX 1: Import the Next.js Image component ---
import type { PostgrestError } from '@supabase/supabase-js'; // Import Supabase error type for clarity

// Define a type for our event object for TypeScript safety.
type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  poster_url?: string | null; // Allow null for the poster URL
  is_free: boolean;
  price: number;
};

// This is the page component, which is a Server Component.
export default async function EventDetailPage({ params }: { params: { id: string } }) {
  // 1. Create a Supabase client instance.
  // The error message suggests your helper function is async, so we must 'await' it.
  const supabase = createSupabaseServerClient(); // --- FIX 2: Correctly get the client instance ---

  // 2. Fetch the specific event directly from the database.
  // --- FIX 3: Apply the 'Event' type to our query result for type safety. ---
  const { data, error }: { data: Event | null, error: PostgrestError | null } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();

  // 3. If the event is not found or there's an error, render the notFound() UI.
  if (error || !data) {
    notFound();
  }
  // Assign data to a new const for easier use, now that we know it's not null.
  const event = data;

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Left Side: Image */}
        {/* --- FIX 1: Use the optimized Next.js Image component --- */}
        <div className="relative w-full aspect-video rounded-lg shadow-lg overflow-hidden">
          <Image
            src={event.poster_url || '/placeholder-event.png'} // Use a local placeholder for better performance
            alt={event.title}
            fill={true}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
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