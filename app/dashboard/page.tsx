'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DollarSign, CreditCard, Calendar, TrendingUp, Plus, CheckCircle, AlertCircle, PiggyBank } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { statsService, memberService } from '@/lib/services';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPaid: 0,
    pendingPayments: 0,
    totalTransactions: 0,
    lastPayment: null as any
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [memberStatus, setMemberStatus] = useState('Pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.memberId) {
      loadMemberData();
    }
  }, [user]);

  const loadMemberData = async () => {
    if (!user?.memberId) return;
    
    try {
      setLoading(true);
      
      // Load member stats and current member status
      const [memberStats, memberData] = await Promise.all([
        statsService.getMemberStats(user.memberId),
        memberService.getMemberById(user.memberId)
      ]);

      setStats(memberStats);
      setRecentPayments([]); // Payments removed
      setMemberStatus(memberData?.status || 'Pending');
      
    } catch (error) {
      console.error('Error loading member data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="member">
        <DashboardLayout userRole="member">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="member">
      <DashboardLayout userRole="member">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-serif font-bold">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-neutral">
                Here's your Chamber account overview and recent activity.
              </p>
            </div>
            
            {/* Prominent Payment Button */}
            <div className="bg-gradient-to-r from-accent/10 to-orange-100 border border-accent/20 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-accent text-lg">Need to make a payment?</h3>
                  <p className="text-sm text-neutral">Pay registration fees, add savings, or repay loans</p>
                </div>
                <Link href="/dashboard/payments">
                  <Button variant="accent" size="lg" className="shadow-lg">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Make Payment
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{stats.totalPaid.toLocaleString()}</div>
                <p className="text-xs text-neutral">All confirmed payments</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                <p className="text-xs text-neutral">Awaiting confirmation</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                <p className="text-xs text-neutral">Total payment history</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
                <Calendar className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.lastPayment ? `₦${stats.lastPayment.amount}` : 'None'}
                </div>
                <p className="text-xs text-neutral">
                  {stats.lastPayment ? formatDate(stats.lastPayment.$createdAt) : 'No payments yet'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  <Button className="w-full" variant="accent">
                    <Plus className="h-4 w-4 mr-2" />
                    New Payment
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PiggyBank className="h-5 w-5 mr-2 text-green-600" />
                  My Savings
                </CardTitle>
                <CardDescription>
                  Track your savings deposits and total balance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/savings">
                  <Button variant="outline" className="w-full">
                    View Savings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-accent" />
                  Payment History
                </CardTitle>
                <CardDescription>
                  View all your payment transactions and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/ledger">
                  <Button variant="outline" className="w-full">
                    View History
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                  My Loans
                </CardTitle>
                <CardDescription>
                  Request loans and track your repayments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/loans">
                  <Button variant="outline" className="w-full">
                    View Loans
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-accent" />
                  Community Events
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
            </Card> */}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Your latest payment activity</CardDescription>
              </CardHeader>
              <CardContent>
                {recentPayments.length > 0 ? (
                  <div className="space-y-4">
                    {recentPayments.map((payment) => (
                      <div key={payment.$id} className="flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            payment.status === 'Confirmed' 
                              ? 'bg-green-500'
                              : payment.status === 'Pending'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`} />
                          <div>
                            <p className="font-medium">{payment.paymentType.replace('_', ' ')}</p>
                            <p className="text-sm text-neutral">₦{payment.amount}</p>
                          </div>
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
                    <Link href="/dashboard/ledger">
                      <Button variant="ghost" className="w-full mt-4">
                        View All Payments
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral">No payments yet</p>
                    <p className="text-sm text-neutral">Make your first payment to get started</p>
                    <Link href="/dashboard/payments">
                      <Button variant="accent" size="sm" className="mt-3">
                        Make Payment
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Account Overview</CardTitle>
                <CardDescription>Your membership information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="text-sm text-neutral">Member Name</span>
                    <span className="font-medium">{user?.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="text-sm text-neutral">Email</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="text-sm text-neutral">Role</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs capitalize">
                      {user?.role}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      memberStatus === 'Active' 
                        ? 'bg-green-100 text-green-800'
                        : memberStatus === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {memberStatus}
                    </span>
                  </div>
                  
                  {/* <Link href="/dashboard/profile">
                    <Button variant="outline" className="w-full mt-4">
                      Edit Profile
                    </Button>
                  </Link> */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}