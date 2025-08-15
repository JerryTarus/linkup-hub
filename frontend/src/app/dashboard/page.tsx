
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, Plus, Users, CreditCard, MessageCircle, Settings } from 'lucide-react'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient()
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's RSVP'd events
  const { data: userEvents } = await supabase
    .from('event_rsvps')
    .select(`
      *,
      events (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get created events if user is admin
  let createdEvents = []
  if (userProfile?.role === 'admin' || userProfile?.role === 'super_admin') {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
    
    createdEvents = data || []
  }

  // Get recent payments
  const { data: recentPayments } = await supabase
    .from('payments')
    .select(`
      *,
      events (title)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin'

  return (
    <div className="min-h-screen bg-brand-bg py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-brand-primary">
              Welcome back, {userProfile?.username || 'User'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening in your Link Up Hub dashboard
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center">
              <Link href="/events">
                <Calendar className="h-6 w-6 mb-2 text-brand-accent" />
                <span className="text-sm">Browse Events</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center">
              <Link href="/dashboard/profile">
                <Settings className="h-6 w-6 mb-2 text-brand-accent" />
                <span className="text-sm">Profile</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center">
              <Link href="/dashboard/chat">
                <MessageCircle className="h-6 w-6 mb-2 text-brand-accent" />
                <span className="text-sm">Community Chat</span>
              </Link>
            </Button>

            {isAdmin && (
              <Button asChild className="h-auto p-4 flex flex-col items-center bg-brand-accent hover:bg-brand-accent/90">
                <Link href="/events/create">
                  <Plus className="h-6 w-6 mb-2" />
                  <span className="text-sm">Create Event</span>
                </Link>
              </Button>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* My Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    My Events
                  </CardTitle>
                  <CardDescription>
                    Events you've RSVP'd to
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userEvents && userEvents.length > 0 ? (
                    <div className="space-y-4">
                      {userEvents.slice(0, 3).map((rsvp) => (
                        <div key={rsvp.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium">{rsvp.events.title}</h3>
                            <p className="text-sm text-gray-600">
                              {format(new Date(rsvp.events.event_date), 'PPP')}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant={rsvp.events.is_paid ? "destructive" : "secondary"}>
                                {rsvp.events.is_paid ? `KES ${rsvp.events.price}` : 'Free'}
                              </Badge>
                              <Badge variant="outline">{rsvp.rsvp_status}</Badge>
                            </div>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/events/${rsvp.events.id}`}>View</Link>
                          </Button>
                        </div>
                      ))}
                      {userEvents.length > 3 && (
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/dashboard/events">View All My Events</Link>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">You haven't RSVP'd to any events yet</p>
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
                        {createdEvents.slice(0, 3).map((event) => (
                          <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h3 className="font-medium">{event.title}</h3>
                              <p className="text-sm text-gray-600">
                                {format(new Date(event.event_date), 'PPP')}
                              </p>
                              <Badge variant={event.is_paid ? "destructive" : "secondary"} className="mt-2">
                                {event.is_paid ? `KES ${event.price}` : 'Free'}
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

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Username:</span>
                    <span className="font-medium">{userProfile?.username || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <Badge variant="outline">{userProfile?.role}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Events Attended:</span>
                    <span className="font-medium">{userEvents?.length || 0}</span>
                  </div>
                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link href="/dashboard/profile">Edit Profile</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Payments */}
              {recentPayments && recentPayments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Recent Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentPayments.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">{payment.events?.title}</p>
                            <p className="text-xs text-gray-600">
                              {format(new Date(payment.created_at), 'MMM d')}
                            </p>
                          </div>
                          <Badge variant={payment.payment_status === 'completed' ? 'default' : 'outline'}>
                            KES {payment.amount}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Admin Panel Access */}
              {isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button asChild variant="outline" className="w-full justify-start">
                        <Link href="/dashboard/admin">
                          <Users className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full justify-start">
                        <Link href="/dashboard/admin/users">
                          <Users className="h-4 w-4 mr-2" />
                          Manage Users
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full justify-start">
                        <Link href="/dashboard/admin/analytics">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Financial Analytics
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
