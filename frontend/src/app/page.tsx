
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, CreditCard, MessageCircle, Shield, Zap } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = createSupabaseServerClient()
  
  // Fetch recent events for the landing page
  const { data: recentEvents, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-brand-primary mb-6">
              Connect. Engage. <span className="text-brand-accent">Thrive.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Join Link Up Hub - the modern platform where communities come together. 
              Discover amazing events, connect with like-minded people, and create 
              unforgettable experiences.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-brand-accent hover:bg-brand-accent/90">
              <Link href="/events">Explore Events</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/signup">Join Community</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-primary mb-4">
              Why Choose Link Up Hub?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the next generation of community engagement with our 
              powerful features designed for modern event management.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-brand-accent transition-colors">
              <CardHeader>
                <Calendar className="h-10 w-10 text-brand-accent mb-4" />
                <CardTitle>Smart Event Management</CardTitle>
                <CardDescription>
                  Create, manage, and discover events with our intuitive platform. 
                  From planning to execution, we've got you covered.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-brand-accent transition-colors">
              <CardHeader>
                <CreditCard className="h-10 w-10 text-brand-accent mb-4" />
                <CardTitle>Seamless Payments</CardTitle>
                <CardDescription>
                  Integrated M-PESA payments make it easy for attendees to secure 
                  their spots with just a few taps.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-brand-accent transition-colors">
              <CardHeader>
                <MessageCircle className="h-10 w-10 text-brand-accent mb-4" />
                <CardTitle>Real-time Chat</CardTitle>
                <CardDescription>
                  Connect with fellow community members through our live chat 
                  feature. Network and engage before, during, and after events.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-brand-accent transition-colors">
              <CardHeader>
                <Shield className="h-10 w-10 text-brand-accent mb-4" />
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Built with security-first mindset. Your data is protected with 
                  enterprise-grade security measures.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-brand-accent transition-colors">
              <CardHeader>
                <Users className="h-10 w-10 text-brand-accent mb-4" />
                <CardTitle>Community Driven</CardTitle>
                <CardDescription>
                  Join a vibrant community of event organizers and attendees. 
                  Share experiences and grow together.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-brand-accent transition-colors">
              <CardHeader>
                <Zap className="h-10 w-10 text-brand-accent mb-4" />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Optimized for performance with server-side rendering and 
                  modern web technologies for instant loading.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Events Section */}
      {recentEvents && recentEvents.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-bg">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-primary mb-4">
                Recent Events
              </h2>
              <p className="text-lg text-gray-600">
                Check out what's happening in our community
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {event.poster_url && (
                    <div className="h-48 bg-gray-200">
                      <img 
                        src={event.poster_url} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {new Date(event.event_date).toLocaleDateString()}
                      </span>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/events/${event.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button asChild size="lg" variant="outline">
                <Link href="/events">View All Events</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of community members who are already connecting and 
            creating amazing experiences together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth/signup">Create Account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-brand-primary border-white hover:bg-white hover:text-brand-primary">
              <Link href="/events">Browse Events</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
