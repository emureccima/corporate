'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'member' | 'admin';
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // No user logged in
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // Check if user is inactive and not already on payment page
      if (user.status !== 'Active' && !window.location.pathname.includes('/payment-required')) {
        router.push('/payment-required');
        return;
      }

      // Role-based access control
      if (requiredRole && user.role !== requiredRole) {
        // If admin tries to access member routes, redirect to admin dashboard
        if (user.role === 'admin' && requiredRole === 'member') {
          router.push('/admin');
        }
        // If member tries to access admin routes, redirect to member dashboard
        else if (user.role === 'member' && requiredRole === 'admin') {
          router.push('/dashboard');
        }
        return;
      }
    }
  }, [user, loading, router, requiredRole, redirectTo]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Don't render children if user is not authenticated or doesn't have required role
  if (!user) {
    return null;
  }

  // Don't render children if user is inactive (except on payment required page)
  if (user.status !== 'Active' && !window.location.pathname.includes('/payment-required')) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}