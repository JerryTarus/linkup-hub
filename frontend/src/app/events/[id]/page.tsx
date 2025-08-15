// Import necessary components
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Define the Event type
type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
};

// Fetch all events on the server.
async function getEvents(): Promise<Event[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/events`, {
    cache: 'no-store', // Ensures the data is fetched fresh on every request
  });
  if (!res.ok) {
    throw new Error('Failed to fetch events');
  }
  return res.json();
}

// The main component for the events list page.
export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="container mx-auto py-10 px-4 bg-brand-bg">
      <h1 className="text-4xl font-bold mb-8 text-center text-brand-primary">
        Discover Events
      </h1>
      {events.length === 0 ? (
        <p className="text-center text-gray-600">No events found. Please check back later!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>
                  {new Date(event.event_date).toUTCString()} - @{event.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <p className="text-gray-700 mb-4 line-clamp-4">{event.description}</p>
                <Button asChild className="mt-auto w-full bg-brand-accent hover:bg-blue-700">
                  <Link href={`/events/${event.id}`}>
                    Learn More & RSVP
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}