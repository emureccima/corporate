'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user?: {
    name: string;
    role: 'member' | 'admin';
  };
  onLogout?: () => void;
}

const navigation = [
  { name: 'Home', href: '/' },
  // { name: 'Events', href: '/events' },
  // { name: 'Gallery', href: '/gallery' },
  // { name: 'Members', href: '/members' },
  // { name: 'Contact', href: '/contact' },
];

export function Header({ user, onLogout }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Promotional Banner */}
      <div className="bg-accent text-accent-foreground text-center py-2 text-sm">
        🎉 Welcome to our Cooperative Society - Building together, Growing together
      </div>
      
      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-foreground text-background shadow-lg">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-serif font-bold">
                CoopSociety
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-accent',
                    pathname === item.href ? 'text-accent' : 'text-background'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Menu & Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-background hover:text-accent transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:block text-sm">{user.name}</span>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-background text-foreground rounded-lg shadow-lg border border-border">
                      <div className="p-2">
                        <div className="px-3 py-2 text-sm text-neutral">
                          Role: {user.role}
                        </div>
                        <Link
                          href="/dashboard"
                          className="flex items-center w-full px-3 py-2 text-sm hover:bg-neutral-100 rounded-md"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                        <button
                          onClick={onLogout}
                          className="flex items-center w-full px-3 py-2 text-sm hover:bg-neutral-100 rounded-md text-red-600"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="accent" size="sm">
                      Join Us
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-background hover:text-accent"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-foreground border-t border-neutral-700">
            <div className="container py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    pathname === item.href 
                      ? 'bg-accent text-accent-foreground' 
                      : 'text-background hover:bg-neutral-800'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {!user && (
                <div className="pt-4 space-y-2">
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="accent" size="sm" className="w-full justify-start">
                      Join Us
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}