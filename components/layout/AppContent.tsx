'use client';

import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function AppContent({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register', '/', '/contact', '/events', '/gallery'];
  
  // Routes that inactive users can access
  const inactiveUserRoutes = ['/payment-required', '/auth/login', '/auth/register', '/'];

  useEffect(() => {
    if (!loading && user) {
      // If user is logged in but inactive, redirect to payment page
      if (user.status !== 'Active' && !inactiveUserRoutes.includes(pathname)) {
        router.push('/payment-required');
      }
    }
  }, [user, loading, pathname, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user || undefined} onLogout={logout} />
      <main className="flex-1">
        {children}
      </main>
      {/* <Footer /> */}
    </div>
  );
}