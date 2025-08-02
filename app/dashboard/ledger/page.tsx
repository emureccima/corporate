'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TrendingUp, Download, Search, Filter, Calendar, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { paymentService } from '@/lib/services';
import { formatDate } from '@/lib/utils';

export default function MemberLedgerPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    if (user?.memberId) {
      loadPaymentHistory();
    }
  }, [user]);

  useEffect(() => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.paymentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => 
        payment.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(payment => 
          new Date(payment.$createdAt) >= filterDate
        );
      }
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter, dateFilter]);

  const loadPaymentHistory = async () => {
    if (!user?.memberId) return;
    
    try {
      setLoading(true);
      const paymentHistory = await paymentService.getMemberPayments(user.memberId);
      setPayments(paymentHistory);
      setFilteredPayments(paymentHistory);
    } catch (error) {
      console.error('Error loading payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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

  const getPaymentTypeDisplay = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const calculateTotals = () => {
    const confirmed = filteredPayments.filter(p => p.status === 'Confirmed');
    const pending = filteredPayments.filter(p => p.status === 'Pending');
    
    return {
      totalConfirmed: confirmed.reduce((sum, p) => sum + (p.amount || 0), 0),
      totalPending: pending.reduce((sum, p) => sum + (p.amount || 0), 0),
      totalTransactions: filteredPayments.length,
      confirmedCount: confirmed.length
    };
  };

  const totals = calculateTotals();

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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-serif font-bold">Payment History</h1>
              <p className="text-neutral">View your complete payment transaction history</p>
            </div>
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Confirmed</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{totals.totalConfirmed.toLocaleString()}</div>
                <p className="text-xs text-neutral">{totals.confirmedCount} payments</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{totals.totalPending.toLocaleString()}</div>
                <p className="text-xs text-neutral">Awaiting confirmation</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.totalTransactions}</div>
                <p className="text-xs text-neutral">All time</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Grand Total</CardTitle>
                <CheckCircle className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{(totals.totalConfirmed + totals.totalPending).toLocaleString()}</div>
                <p className="text-xs text-neutral">Confirmed + Pending</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="all">All Time</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="quarter">Last 3 Months</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    onClick={loadPaymentHistory}
                    className="w-full"
                  >
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                {filteredPayments.length} transaction{filteredPayments.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPayments.length > 0 ? (
                <div className="space-y-4">
                  {filteredPayments.map((payment) => (
                    <div key={payment.$id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(payment.status)}
                        <div>
                          <h4 className="font-medium">{getPaymentTypeDisplay(payment.paymentType)}</h4>
                          <p className="text-sm text-neutral">{payment.description}</p>
                          <p className="text-xs text-neutral">{formatDate(payment.$createdAt)}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold">₦{payment.amount}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                  <p className="text-neutral mb-4">
                    {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'You haven\'t made any payments yet.'
                    }
                  </p>
                  {!searchTerm && statusFilter === 'all' && dateFilter === 'all' && (
                    <Button variant="accent" onClick={() => window.location.href = '/dashboard/payments'}>
                      Make Your First Payment
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}