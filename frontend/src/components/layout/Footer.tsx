import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/images/linkup-hub-logo.jpg"
                alt="LinkUp Hub Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-lg font-bold text-brand-primary">LinkUp Hub</span>
            </Link>
            <p className="text-gray-500 text-sm">
              Connect, engage, and thrive with your community.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Solutions</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/events" className="text-base text-gray-500 hover:text-gray-900">Events</Link></li>
              <li><Link href="/community" className="text-base text-gray-500 hover:text-gray-900">Community</Link></li>
              <li><Link href="/pricing" className="text-base text-gray-500 hover:text-gray-900">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/contact" className="text-base text-gray-500 hover:text-gray-900">Contact</Link></li>
              <li><Link href="/faq" className="text-base text-gray-500 hover:text-gray-900">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/privacy" className="text-base text-gray-500 hover:text-gray-900">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-base text-gray-500 hover:text-gray-900">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-base text-gray-400">&copy; {new Date().getFullYear()} LinkUp Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
