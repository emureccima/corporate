'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'member';
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar userRole={userRole} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 w-full">
          <div className="p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}