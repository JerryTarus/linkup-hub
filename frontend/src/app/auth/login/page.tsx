// Mark this component as a Client Component because it uses hooks (useState, etc.) for interactivity.
'use client';

// Import necessary React hooks and components.
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // For redirecting the user after login.
import { useForm } from 'react-hook-form'; // For robust form handling.
import { zodResolver } from '@hookform/resolvers/zod'; // To use Zod for form validation.
import * as z from 'zod'; // Zod library for schema validation.
import axios from 'axios'; // For making HTTP requests to our backend.


// Import UI components from Shadcn.
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast'; // For showing notifications.

// Define the validation schema for the login form using Zod.
// This ensures that the data has the correct shape and format before submission.
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

// The main Login Page component.
export default function LoginPage() {
  // Hook for programmatic navigation.
  const router = useRouter();
  // Hook for displaying toast notifications.
  const { toast } = useToast();
  // State to manage loading status during form submission.
  const [isLoading, setIsLoading] = useState(false);

  // Initialize react-hook-form with our Zod schema.
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // The function to handle form submission.
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    // Set loading to true to disable the button and show a loading indicator.
    setIsLoading(true);
    try {
      // Get the backend API URL from environment variables.
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      // Make a POST request to the backend's login endpoint.
      // 'withCredentials: true' is crucial for sending our HttpOnly cookie.
      await axios.post(`${apiUrl}/auth/login`, values, { withCredentials: true });

      // If the request is successful, show a success toast.
      toast({
        title: 'Success!',
        description: 'You have been logged in successfully.',
      });

      // Redirect the user to their dashboard.
      // We use router.refresh() to ensure the server re-renders with the new auth state.
      router.push('/dashboard');
      router.refresh();

    } catch (error) {
      // Handle errors from the API call.
      // We check if the error is an Axios error to access the response data.
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (axios.isAxiosError(error) && error.response) {
        // Use the error message from the backend if available.
        errorMessage = error.response.data.message || errorMessage;
      }
      // Show an error toast to the user.
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      // Set loading back to false regardless of the outcome.
      setIsLoading(false);
    }
  }

  // Render the JSX for the login form.
  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-bg">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>Log in to your Link Up Hub account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Log In'}
              </Button>
            </form>
          </Form>
            <p className="mt-4 text-center text-sm">
                {`Don't have an account? `}
                    <Link href="/signup" className="underline text-brand-accent">
                        Sign up
                    </Link>
            </p>
        </CardContent>
      </Card>
    </div>
  );
}