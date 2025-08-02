'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Calendar, 
  Camera, 
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign,
  FileText,
  TrendingUp,
  UserPlus,
  PiggyBank
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  userRole: 'admin' | 'member';
}

export function Sidebar({ userRole }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Members', href: '/admin/members', icon: Users },
    { name: 'Registrations', href: '/admin/registrations', icon: UserPlus },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Savings', href: '/admin/savings', icon: PiggyBank },
    { name: 'Loans', href: '/admin/loans', icon: DollarSign },
    // { name: 'Events', href: '/admin/events', icon: Calendar },
    // { name: 'Gallery', href: '/admin/gallery', icon: Camera },
    // { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const memberNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Payments', href: '/dashboard/payments', icon: CreditCard },
    { name: 'My Savings', href: '/dashboard/savings', icon: PiggyBank },
    { name: 'My Loans', href: '/dashboard/loans', icon: DollarSign },
    { name: 'My Ledger', href: '/dashboard/ledger', icon: TrendingUp },
    // { name: 'Events', href: '/events', icon: Calendar },
    // { name: 'Gallery', href: '/gallery', icon: Camera },
    { name: 'Profile', href: '/dashboard/profile', icon: Settings },
  ];

  const navigation = userRole === 'admin' ? adminNavigation : memberNavigation;

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-foreground text-background p-2 rounded-lg shadow-lg"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed top-0 left-0 h-full w-64 bg-foreground text-background transform transition-transform duration-300 ease-in-out z-40',
        'md:translate-x-0 md:static md:z-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-neutral-700">
            <div className="flex items-center space-x-3">
              <Image
                src="/emurelogo.jpg"
                alt="EMURECCIMA Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <h2 className="text-lg font-serif font-bold">EMURECCIMA</h2>
                <p className="text-xs text-neutral-300">
                  {userRole === 'admin' ? 'Admin Panel' : 'Member Portal'}
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-neutral-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-accent">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-neutral-400 capitalize">{userRole}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive 
                      ? 'bg-accent text-accent-foreground' 
                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-neutral-700">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-neutral-300 hover:text-white hover:bg-neutral-800"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content spacer for desktop */}
      <div className="hidden md:block md:w-20 flex-shrink-0" />
    </>
  );
}