
import Link from 'next/link';
import { format } from 'date-fns';
import { CalendarDays, MapPin, ArrowRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Define the Event type
interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  poster_url?: string;
  is_free: boolean;
  price?: number;
  created_at: string;
}

// Fetch all events
async function getEvents(): Promise<Event[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${apiUrl}/events`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">All Events</h1>
          <p className="text-gray-600 text-lg">
            Discover and join amazing events happening in your community
          </p>
        </div>

        {/* Events Grid */}
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {event.poster_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={event.poster_url}
                      alt={event.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant={event.is_free ? "secondary" : "destructive"} className="mb-2">
                      {event.is_free ? 'Free' : `KES ${event.price}`}
                    </Badge>
                  </div>
                  
                  <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                  
                  <CardDescription className="line-clamp-3">
                    {event.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarDays className="h-4 w-4" />
                      <span>{format(new Date(event.event_date), 'PPP')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>

                  <Button asChild className="w-full">
                    <Link href={`/events/${event.id}`}>
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CalendarDays className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
            <p className="text-gray-600 mb-6">
              There are currently no events available. Check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
