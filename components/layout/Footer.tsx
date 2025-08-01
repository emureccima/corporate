import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-bold">CoopSociety</h3>
            <p className="text-neutral-300 text-sm">
              Building a stronger community through cooperative values and mutual support.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-neutral-300 hover:text-accent cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-neutral-300 hover:text-accent cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-neutral-300 hover:text-accent cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-neutral-300 hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-neutral-300 hover:text-accent transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-neutral-300 hover:text-accent transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/members" className="text-neutral-300 hover:text-accent transition-colors">
                  Members
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard/savings" className="text-neutral-300 hover:text-accent transition-colors">
                  Savings Account
                </Link>
              </li>
              <li>
                <Link href="/dashboard/loans" className="text-neutral-300 hover:text-accent transition-colors">
                  Loan Services
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-neutral-300 hover:text-accent transition-colors">
                  Membership
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-300 hover:text-accent transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-accent" />
                <span className="text-neutral-300">info@coopsociety.org</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-accent" />
                <span className="text-neutral-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="text-neutral-300">123 Community St, City, State</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-8 pt-8 text-center text-sm text-neutral-300">
          <p>&copy; {currentYear} CoopSociety. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}