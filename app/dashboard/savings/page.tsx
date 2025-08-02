'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PiggyBank, Search, CheckCircle, Clock, XCircle, TrendingUp, Download, Calendar, DollarSign } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { savingsService } from '@/lib/services';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function MemberSavingsPage() {
  const { user } = useAuth();
  const [savingsPayments, setSavingsPayments] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSavings: 0,
    confirmedSavings: 0,
    pendingSavings: 0,
    totalAmount: 0,
    pendingAmount: 0,
    averageDeposit: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user?.memberId) {
      loadSavingsData();
    }
  }, [user?.memberId]);

  useEffect(() => {
    let filtered = savingsPayments;

    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.amount?.toString().includes(searchTerm) ||
        payment.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDate(payment.$createdAt).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => 
        payment.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredPayments(filtered);
  }, [savingsPayments, searchTerm, statusFilter]);

  const loadSavingsData = async () => {
    if (!user?.memberId) return;
    
    try {
      setLoading(true);
      const memberSavings = await savingsService.getMemberSavingsPayments(user.memberId);
      
      // Calculate member-specific stats
      const confirmedSavings = memberSavings.filter(s => s.status === 'Confirmed');
      const pendingSavings = memberSavings.filter(s => s.status === 'Pending');
      const totalAmount = confirmedSavings.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const pendingAmount = pendingSavings.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const averageDeposit = confirmedSavings.length > 0 ? totalAmount / confirmedSavings.length : 0;

      setSavingsPayments(memberSavings);
      setFilteredPayments(memberSavings);
      setStats({
        totalSavings: memberSavings.length,
        confirmedSavings: confirmedSavings.length,
        pendingSavings: pendingSavings.length,
        totalAmount,
        pendingAmount,
        averageDeposit
      });
    } catch (error) {
      console.error('Error loading savings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const downloadSavingsReport = () => {
    const csvContent = [
      ['Date', 'Amount', 'Status', 'Description'].join(','),
      ...filteredPayments.map(payment => [
        formatDate(payment.$createdAt),
        `$${payment.amount}`,
        payment.status,
        payment.description || 'Savings deposit'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user?.name}_savings_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
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
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-serif font-bold">My Savings</h1>
              <p className="text-neutral">Track your savings deposits and total balance</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">${stats.totalAmount.toLocaleString()}</div>
              <div className="text-sm text-neutral">Total Confirmed Savings</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800 text-lg">Ready to save more?</h3>
                <p className="text-sm text-green-700">Add money to your savings account</p>
              </div>
              <Link href="/dashboard/payments">
                <Button variant="accent" size="lg" className="shadow-lg">
                  <PiggyBank className="mr-2 h-5 w-5" />
                  Add Savings
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                <PiggyBank className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSavings}</div>
                <p className="text-xs text-neutral">All savings deposits</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.confirmedSavings}</div>
                <p className="text-xs text-neutral">Processed deposits</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingSavings}</div>
                <p className="text-xs text-neutral">Awaiting confirmation</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Deposit</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.averageDeposit.toFixed(2)}</div>
                <p className="text-xs text-neutral">Per confirmed deposit</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Search & Filter
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadSavingsReport}
                  disabled={filteredPayments.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Input
                    placeholder="Search by amount, status, or date..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    onClick={loadSavingsData}
                    className="w-full"
                  >
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Savings History */}
          <Card>
            <CardHeader>
              <CardTitle>Savings History</CardTitle>
              <CardDescription>
                {filteredPayments.length} savings deposit{filteredPayments.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPayments.length > 0 ? (
                <div className="space-y-4">
                  {filteredPayments.map((payment) => (
                    <div key={payment.$id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <PiggyBank className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">${payment.amount}</h4>
                          <p className="text-sm text-neutral">
                            {payment.description || 'Savings deposit'}
                          </p>
                          <p className="text-xs text-neutral flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(payment.$createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                        {payment.status === 'Confirmed' && payment.confirmedAt && (
                          <p className="text-xs text-neutral mt-1">
                            Confirmed: {formatDate(payment.confirmedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <PiggyBank className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No savings deposits found</h3>
                  <p className="text-neutral mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Start building your savings by making your first deposit.'
                    }
                  </p>
                  <Link href="/dashboard/payments">
                    <Button variant="accent">
                      <PiggyBank className="h-4 w-4 mr-2" />
                      Make First Deposit
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}