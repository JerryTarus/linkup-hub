import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/images/linkup-hub-logo.jpg" // Assuming you'll place the logo here
                alt="LinkUp Hub Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-xl font-bold text-brand-primary">LinkUp Hub</span>
            </Link>
          </div>
          <nav className="hidden md:flex md:space-x-8">
            <Link href="/events" className="text-gray-600 hover:text-brand-accent transition-colors">
              Events
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-brand-accent transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-brand-accent transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center space-x-2">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Log In</Link>
            </Button>
            <Button asChild className="bg-brand-accent hover:bg-brand-accent/90">
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
