'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/Card';
import { forceLogout } from '@/lib/auth-utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for success message from registration
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  // Role-based dashboard routing - redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const handleClearSessions = async () => {
    try {
      await forceLogout();
      setError('');
      setSuccessMessage('Sessions cleared. You can now try logging in again.');
    } catch (error) {
      console.error('Error clearing sessions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await login(email, password);
      // Routing will be handled by useEffect above based on user role
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle session conflict error specifically
      if (error.message?.includes('session is active') || error.message?.includes('session is prohibited')) {
        setError('Session conflict detected. Please click "Clear Sessions" below and try again.');
      } else {
        setError(error.message || 'Failed to sign in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl border-0 overflow-hidden">
          <div className="bg-orange-600 h-2 w-full"></div>
          <CardHeader className="text-center mt-4">
            <CardTitle className="text-3xl font-bold text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-neutral-600 mt-1">
              Sign in to your cooperative account
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            {successMessage && (
              <div className="mb-6 text-sm text-green-600 bg-green-100 border border-green-300 p-4 rounded-md">
                {successMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />

              {error && (
                <div className="text-sm text-red-600 bg-red-100 border border-red-300 p-3 rounded-md">
                  {error}
                  {error.includes('Session conflict') && (
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearSessions}
                        className="text-xs"
                      >
                        Clear Sessions
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 font-semibold rounded-md"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-neutral-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-orange-600 hover:underline font-medium">
                Join our cooperative
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
