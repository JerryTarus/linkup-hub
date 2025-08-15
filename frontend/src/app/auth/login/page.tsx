// Mark this component as a Client Component because it uses hooks (useState, etc.) for interactivity.
'use client';

// Import necessary React hooks and components.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// --- FIX 1: Correctly import Axios and the isAxiosError type guard ---
import axios, { isAxiosError } from 'axios';

// Import UI components from Shadcn.
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

// Assuming you've run `npx shadcn-ui@latest add toast`, this import will now work.
import { useToast } from '@/hooks/use-toast';

// Define the validation schema for the login form using Zod.
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

// The main Login Page component.
export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      await axios.post(`${apiUrl}/auth/login`, values, { withCredentials: true });

      toast({
        title: 'Success!',
        description: 'You have been logged in successfully.',
      });

      router.push('/dashboard');
      router.refresh();

    } catch (error) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      // --- FIX 2: Use the imported isAxiosError function as a type guard ---
      // This safely checks if 'error' is an Axios error and allows TypeScript to access its properties.
      if (isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }

      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
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