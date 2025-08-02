'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, DollarSign, UserCheck, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { statsService, paymentService, memberService } from '@/lib/services';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingPayments: 0,
    totalAmount: 0
  });
  
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentMembers, setRecentMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [adminStats, payments, members] = await Promise.all([
        statsService.getAdminStats(),
        paymentService.getRecentPayments(5),
        memberService.getAllMembers()
      ]);

      setStats(adminStats);
      setRecentPayments(payments);
      
      // Get recent members (last 5)
      const sortedMembers = members
        .sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())
        .slice(0, 5);
      setRecentMembers(sortedMembers);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <DashboardLayout userRole="admin">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout userRole="admin">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
            <p className="text-neutral">Welcome back, {user?.name}. Here's what's happening in your cooperative.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMembers}</div>
                <p className="text-xs text-neutral">Active: {stats.activeMembers}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <UserCheck className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                <p className="text-xs text-neutral">Require confirmation</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{stats.totalAmount.toLocaleString()}</div>
                <p className="text-xs text-neutral">All confirmed payments</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalMembers > 0 ? '+12%' : '0%'}
                </div>
                <p className="text-xs text-neutral">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-accent" />
                  Member Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/members">
                  <Button className="w-full" variant="outline">
                    View All Members ({stats.totalMembers})
                  </Button>
                </Link>
                <Link href="/admin/payments">
                  <Button className="w-full" variant="outline">
                    Pending Payments ({stats.pendingPayments})
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-accent" />
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ₦{stats.totalAmount.toLocaleString()}
                  </div>
                  <p className="text-sm text-green-600">Total Revenue</p>
                </div>
                <Link href="/admin/reports">
                  <Button className="w-full" variant="outline">
                    View Reports
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-accent" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  variant="accent"
                  onClick={loadDashboardData}
                >
                  Refresh Data
                </Button>
                <Link href="/admin/settings">
                  <Button className="w-full" variant="outline">
                    System Settings
                  </Button>
                </Link>
              </CardContent>
            </Card> */}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Latest payment submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {recentPayments.length > 0 ? (
                  <div className="space-y-4">
                    {recentPayments.map((payment) => (
                      <div key={payment.$id} className="flex items-center justify-between border-b border-border pb-2">
                        <div className="flex-1">
                          <p className="font-medium">{payment.memberName}</p>
                          <p className="text-sm text-neutral">
                            {payment.paymentType.replace('_', ' ')} - ₦{payment.amount}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            payment.status === 'Confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </span>
                          <p className="text-xs text-neutral mt-1">
                            {formatDate(payment.$createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral text-center py-4">No recent payments</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Members */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Members</CardTitle>
                <CardDescription>Newly registered members</CardDescription>
              </CardHeader>
              <CardContent>
                {recentMembers.length > 0 ? (
                  <div className="space-y-4">
                    {recentMembers.map((member) => (
                      <div key={member.$id} className="flex items-center justify-between border-b border-border pb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-accent">
                              {member.fullName?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{member.fullName}</p>
                            <p className="text-sm text-neutral">{member.membershipNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            member.status === 'Active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {member.status}
                          </span>
                          <p className="text-xs text-neutral mt-1">
                            {formatDate(member.$createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral text-center py-4">No recent members</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}