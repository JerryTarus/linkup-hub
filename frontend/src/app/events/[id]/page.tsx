import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarDays, MapPin, Users, Clock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import EventRSVPButton from './EventRSVPButton';

// Fetch event data
async function getEvent(id: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${apiUrl}/events/${id}`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch event');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

interface EventPageProps {
  params: {
    id: string;
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await getEvent(params.id);

  if (!event) {
    notFound();
  }

  const eventDate = new Date(event.event_date);
  const isUpcoming = eventDate > new Date();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Event Header */}
        <div className="mb-8">
          {event.poster_url && (
            <div className="aspect-video mb-6 rounded-lg overflow-hidden">
              <img
                src={event.poster_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{event.title}</h1>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarDays className="h-5 w-5" />
                  <span>{format(eventDate, 'PPP')}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-5 w-5" />
                  <span>{format(eventDate, 'p')}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <span>{event.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <Badge variant={event.is_free ? "secondary" : "destructive"} className="text-lg px-3 py-1">
                  {event.is_free ? 'Free Event' : `KES ${event.price}`}
                </Badge>

                <Badge variant={isUpcoming ? "default" : "outline"}>
                  {isUpcoming ? 'Upcoming' : 'Past Event'}
                </Badge>
              </div>
            </div>

            <div className="lg:w-80">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Join Event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Button disabled className="w-full">Loading...</Button>}>
                    <EventRSVPButton eventId={event.id} isUpcoming={isUpcoming} />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Event Description */}
        <Card>
          <CardHeader>
            <CardTitle>About This Event</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}