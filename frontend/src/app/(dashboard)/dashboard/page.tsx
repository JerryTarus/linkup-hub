// Import server-side helpers
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

// This is a Server Component, so we can make its main function 'async'.
export default async function DashboardPage() {
  // Create a Supabase client for server-side operations.
  const supabase = createSupabaseServerClient();

  // 'await' the promise to get the currently authenticated user's session data.
  const { data: { user } } = await supabase.auth.getUser();

  // If there is no user, they are not logged in. Redirect them to the login page.
  if (!user) {
    redirect('/login');
  }

  // 'await' the promise to fetch the user's full profile from our 'profiles' table.
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, role')
    .eq('id', user.id)
    .single();

  // 'await' the promise to fetch events created by this user.
  const { data: events, error } = await supabase
    .from('events')
    .select('id, title, event_date')
    .eq('created_by', user.id)
    .order('event_date', { ascending: false });

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {profile?.username || 'User'}!</h1>
        <p className="text-muted-foreground">Here's your dashboard overview.</p>
      </div>

      {/* Only show the "Create Event" button to Admins */}
      {profile?.role === 'Admin' || profile?.role === 'Super Admin' ? (
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/events/create">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Event
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Created Events</CardTitle>
            <CardDescription>A list of events you have created and are managing.</CardDescription>
          </CardHeader>
          <CardContent>
            {events && events.length > 0 ? (
              <ul className="space-y-4">
                {events.map(event => (
                  <li key={event.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.event_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href={`/events/${event.id}`}>View</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>You have not created any events yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}