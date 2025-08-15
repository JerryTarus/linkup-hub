
import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarDays, Users, Plus, User, Settings } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Get current user
async function getCurrentUser() {
  const supabase = createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/auth/login');
  }

  return user;
}

// Get user's RSVP'd events
async function getUserRSVPs(userId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${apiUrl}/profile/rsvps`, {
      headers: {
        'Authorization': `Bearer ${userId}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    return [];
  }
}

// Get user's created events (for admins)
async function getUserCreatedEvents(userId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${apiUrl}/events?created_by=${userId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const allEvents = await response.json();
    // Filter events created by this user (in case backend doesn't support filtering)
    return allEvents.filter((event: any) => event.created_by === userId);
  } catch (error) {
    console.error('Error fetching created events:', error);
    return [];
  }
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  is_free: boolean;
  price?: number;
  created_by: string;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  // Check if user is admin/super admin
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'Admin' || profile?.role === 'Super Admin';
  
  const rsvpEvents = await getUserRSVPs(user.id);
  const createdEvents = isAdmin ? await getUserCreatedEvents(user.id) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            Welcome back, {user.user_metadata?.full_name || user.email}!
          </h1>
          <p className="text-gray-600">
            Manage your events and stay updated with your community
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events Joined</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rsvpEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                Active RSVPs
              </p>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Events Created</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{createdEvents.length}</div>
                <p className="text-xs text-muted-foreground">
                  Events organized
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/dashboard/profile">Edit Profile</Link>
              </Button>
              {isAdmin && (
                <Button asChild size="sm" className="w-full">
                  <Link href="/events/create">Create Event</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* RSVP'd Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Your Upcoming Events
              </CardTitle>
              <CardDescription>
                Events you've RSVP'd to
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rsvpEvents.length > 0 ? (
                <div className="space-y-4">
                  {rsvpEvents.slice(0, 3).map((event: Event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-600">
                          {format(new Date(event.event_date), 'PPP')}
                        </p>
                        <Badge variant={event.is_free ? "secondary" : "destructive"} className="mt-2">
                          {event.is_free ? 'Free' : `KES ${event.price}`}
                        </Badge>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/events/${event.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                  {rsvpEvents.length > 3 && (
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/dashboard/events">View All RSVPs</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No upcoming events</p>
                  <Button asChild>
                    <Link href="/events">Browse Events</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Created Events (Admin only) */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  My Created Events
                </CardTitle>
                <CardDescription>
                  Events you've organized
                </CardDescription>
              </CardHeader>
              <CardContent>
                {createdEvents.length > 0 ? (
                  <div className="space-y-4">
                    {createdEvents.slice(0, 3).map((event: Event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="text-sm text-gray-600">
                            {format(new Date(event.event_date), 'PPP')}
                          </p>
                          <Badge variant={event.is_free ? "secondary" : "destructive"} className="mt-2">
                            {event.is_free ? 'Free' : `KES ${event.price}`}
                          </Badge>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/events/${event.id}`}>Manage</Link>
                        </Button>
                      </div>
                    ))}
                    {createdEvents.length > 3 && (
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/dashboard/admin/events">View All Created Events</Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">You haven't created any events yet</p>
                    <Button asChild>
                      <Link href="/events/create">Create Your First Event</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
