import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface EventPageProps {
  params: { id: string };
}

export default async function EventPage({ params }: EventPageProps) {
  const supabase = createClient();
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!event) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="aspect-w-16 aspect-h-9 mb-6">
            <img
              src={event.image_url || '/placeholder-event.jpg'}
              alt={event.title}
              className="rounded-lg w-full h-auto"
            />
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              {new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="text-gray-600 mb-4">Location: {event.location}</p>
            <p className="text-lg">{event.description}</p>
          </div>
        </div>
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Event Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Date & Time</h3>
                <p>
                  {new Date(event.date).toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Location</h3>
                <p>{event.location}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Price</h3>
                <p>{event.price > 0 ? `$${event.price.toFixed(2)}` : 'Free'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Capacity</h3>
                <p>{event.capacity} attendees</p>
              </div>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Get Tickets
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
