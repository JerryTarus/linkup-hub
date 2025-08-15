
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { Calendar, MapPin, Users, Clock, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import EventRSVPButton from './EventRSVPButton'

interface EventPageProps {
  params: {
    id: string
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const supabase = createSupabaseServerClient()
  
  // Fetch event details
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !event) {
    notFound()
  }

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  // If user is logged in, check if they already RSVP'd
  let hasRSVPd = false
  if (user) {
    const { data: rsvp } = await supabase
      .from('event_rsvps')
      .select('id')
      .eq('event_id', event.id)
      .eq('user_id', user.id)
      .single()
    
    hasRSVPd = !!rsvp
  }

  // Get RSVP count
  const { count: rsvpCount } = await supabase
    .from('event_rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id)

  return (
    <div className="min-h-screen bg-brand-bg py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Event Header */}
          <div className="mb-8">
            {event.poster_url && (
              <div className="w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
                <img 
                  src={event.poster_url} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-brand-primary mb-4">
                  {event.title}
                </h1>
                
                <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>{format(new Date(event.event_date), 'PPP')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{format(new Date(event.event_date), 'p')}</span>
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>{rsvpCount || 0} attending</span>
                  </div>
                </div>

                <div className="flex gap-2 mb-6">
                  <Badge 
                    variant={event.is_paid ? "destructive" : "secondary"}
                    className="text-sm"
                  >
                    {event.is_paid ? `KES ${event.price}` : 'Free'}
                  </Badge>
                  {event.max_attendees && (
                    <Badge variant="outline">
                      Max {event.max_attendees} attendees
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* RSVP/Payment Button */}
              <div className="md:min-w-[200px]">
                <EventRSVPButton 
                  event={event}
                  user={user}
                  hasRSVPd={hasRSVPd}
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About This Event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </CardContent>
          </Card>

          {/* Event Info Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {format(new Date(event.event_date), 'PPP')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">
                    {format(new Date(event.event_date), 'p')}
                  </span>
                </div>
                {event.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{event.location}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium">
                    {event.is_paid ? `KES ${event.price}` : 'Free'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Attendance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Attending:</span>
                  <span className="font-medium">{rsvpCount || 0} people</span>
                </div>
                {event.max_attendees && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium">{event.max_attendees} people</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Spots Left:</span>
                  <span className="font-medium">
                    {event.max_attendees 
                      ? Math.max(0, event.max_attendees - (rsvpCount || 0))
                      : 'Unlimited'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
