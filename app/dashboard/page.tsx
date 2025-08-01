'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DollarSign, Users, Calendar, TrendingUp, CreditCard, Plus } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSavings: 0,
    activeLoans: 0,
    upcomingEvents: 0,
    totalMembers: 0,
  });

  return (
    <ProtectedRoute requiredRole="member">
      <div className="container py-8 space-y-8">
      {/* Welcome Section */}
      <div className="space-y-4">
        <h1 className="text-3xl font-serif font-bold">
          Welcome back, {user.name}!
        </h1>
        <p className="text-neutral">
          {user.role === 'admin' ? 'Admin Dashboard' : 'Member Dashboard'} • Manage your cooperative account
        </p>
        
        {/* Prominent Payment Button */}
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-accent">Need to make a payment?</h3>
              <p className="text-sm text-neutral">Pay registration fees, add savings, or repay loans</p>
            </div>
            <Link href="/dashboard/payments">
              <Button variant="accent" size="lg">
                <DollarSign className="mr-2 h-5 w-5" />
                Make Payment
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSavings.toLocaleString()}</div>
            <p className="text-xs text-neutral">+2.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLoans}</div>
            <p className="text-xs text-neutral">Current active loans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-neutral">This month</p>
          </CardContent>
        </Card>

        {user.role === 'admin' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-neutral">Active members</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-accent" />
              Make a Payment
            </CardTitle>
            <CardDescription>
              Pay registration fees, add to savings, or repay loans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/payments">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                New Payment
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-accent" />
              View Ledger
            </CardTitle>
            <CardDescription>
              Check your savings and loan transaction history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/ledger">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-accent" />
              Upcoming Events
            </CardTitle>
            <CardDescription>
              Stay updated with community events and meetings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/events">
              <Button variant="outline" className="w-full">
                View Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Admin Quick Actions */}
      {user.role === 'admin' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-bold">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Members</CardTitle>
                <CardDescription>
                  View, add, and manage cooperative members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/members">
                  <Button variant="accent" className="w-full">
                    Manage Members
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Events</CardTitle>
                <CardDescription>
                  Create and manage community events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/events">
                  <Button variant="accent" className="w-full">
                    Manage Events
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>
                  View financial reports and member ledgers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/reports">
                  <Button variant="accent" className="w-full">
                    View Reports
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}