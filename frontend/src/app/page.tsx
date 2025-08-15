// Import Next.js components and Shadcn UI components.
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

// Define a type for our event object for TypeScript safety.
type Event = {
  id: string;
  title: string;
  description: string;
  event_date: string;
};

// This is an async Server Component, allowing us to fetch data directly.
export default async function LandingPage() {
  // Fetch a few upcoming events to display on the landing page.
  // Using { cache: 'no-store' } to ensure data is always fresh on page load.
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/events?limit=3`, {
    cache: 'no-store',
  });
  const recentEvents: Event[] = await res.json();

  return (
    <main className="flex flex-col items-center bg-brand-bg text-brand-primary min-h-screen">
      {/* Hero Section */}
      <section className="w-full text-center py-20 md:py-32">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Connect, Engage, and Grow
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-700 mb-8">
            Discover vibrant events, connect with your community, and manage everything in one place. Your next experience awaits.
          </p>
          <Button asChild size="lg" className="bg-brand-accent hover:bg-blue-700">
            <Link href="/events">
              Browse All Events <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="w-full bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-xl transition-shadow">
                 <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>{new Date(event.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</CardDescription>
                  </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-gray-600 mb-4">{event.description}</p>
                  <Button asChild variant="outline">
                    <Link href={`/events/${event.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}