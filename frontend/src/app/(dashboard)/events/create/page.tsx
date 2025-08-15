// This is a Client Component due to its interactive form nature.
'use client';

// Import React hooks, libraries, and components
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios, { isAxiosError } from 'axios';
import { toast } from 'sonner';

// Import UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

// Define a detailed Zod schema for event creation validation.
const eventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  location: z.string().min(3, 'Location is required.'),
  event_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Please enter a valid date and time.',
  }),
  poster_url: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  is_free: z.boolean().default(false),
  price: z.coerce.number().min(0, 'Price cannot be negative.').optional(),
}).refine((data) => data.is_free || (data.price !== undefined && data.price > 0), {
  message: 'Price must be greater than 0 for paid events.',
  path: ['price'],
});

export default function CreateEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      event_date: '',
      poster_url: '',
      is_free: false,
    },
  });

  // This 'onSubmit' function must be 'async' to handle the API call.
  async function onSubmit(values: z.infer<typeof eventSchema>) {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      
      // We 'await' the API response. The 'withCredentials' flag is crucial
      // for sending the HttpOnly cookie to our protected backend route.
      const response = await axios.post(`${apiUrl}/events`, values, { withCredentials: true });

      toast.success('Event Created Successfully!');
      
      // Redirect to the newly created event's detail page.
      router.push(`/events/${response.data.id}`);
    } catch (error) {
      let errorMessage = 'Failed to create event. Please check your permissions.';
      if (isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      toast.error('Error', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader><CardTitle>Create a New Event</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title, Description, Location, Date, Poster URL fields... */}
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Event Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Nairobi, Kenya" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="event_date" render={({ field }) => (
                  <FormItem><FormLabel>Date and Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>
              <FormField control={form.control} name="poster_url" render={({ field }) => (
                <FormItem><FormLabel>Poster URL</FormLabel><FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <div className="flex items-center space-x-4">
                <FormField control={form.control} name="is_free" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <div className="space-y-1 leading-none"><FormLabel>This event is free</FormLabel></div>
                  </FormItem>
                )}/>
                {!form.watch('is_free') && (
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Price (Ksh)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                )}
              </div>
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? 'Creating Event...' : 'Create Event'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}