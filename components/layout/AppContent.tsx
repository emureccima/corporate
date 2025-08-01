'use client';

import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function AppContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user || undefined} onLogout={logout} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}