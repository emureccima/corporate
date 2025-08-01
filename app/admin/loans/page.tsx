'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreditCard, Search, CheckCircle, XCircle, Clock, Eye, DollarSign, TrendingDown } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { loansService } from '@/lib/services';
import { databases, appwriteConfig } from '@/lib/appwrite';
import { formatDate } from '@/lib/utils';

export default function AdminLoansPage() {
  const [loanPayments, setLoanPayments] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRepayments: 0,
    confirmedRepayments: 0,
    pendingRepayments: 0,
    totalAmount: 0,
    pendingAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    loadLoansData();
  }, []);

  useEffect(() => {
    let filtered = loanPayments;

    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.memberId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => 
        payment.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredPayments(filtered);
  }, [loanPayments, searchTerm, statusFilter]);

  const loadLoansData = async () => {
    try {
      setLoading(true);
      const [payments, loanStats] = await Promise.all([
        loansService.getAllLoanPayments(),
        loansService.getLoanStats()
      ]);

      setLoanPayments(payments);
      setFilteredPayments(payments);
      setStats(loanStats);
    } catch (error) {
      console.error('Error loading loans data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoanAction = async (paymentId: string, action: 'confirm' | 'reject') => {
    try {
      setProcessingPayment(paymentId);
      
      if (action === 'confirm') {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.paymentsCollectionId,
          paymentId,
          {
            status: 'Confirmed',
            confirmed: true,
            confirmedAt: new Date().toISOString()
          }
        );
        alert('Loan repayment confirmed successfully!');
      } else if (action === 'reject') {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.paymentsCollectionId,
          paymentId,
          {
            status: 'Rejected',
            confirmed: false,
            rejectedAt: new Date().toISOString()
          }
        );
        alert('Loan repayment has been rejected.');
      }
      
      // Refresh data after action
      await loadLoansData();
    } catch (error) {
      console.error(`Error ${action}ing loan repayment:`, error);
      alert(`Failed to ${action} loan repayment. Please try again.`);
    } finally {
      setProcessingPayment(null);
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-serif font-bold">Loans Management</h1>
              <p className="text-neutral">Manage loan repayments and track outstanding balances</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">${stats.totalAmount.toLocaleString()}</div>
              <div className="text-sm text-neutral">Total Repayments Confirmed</div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Repayments</CardTitle>
                <CreditCard className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRepayments}</div>
                <p className="text-xs text-neutral">All loan repayments</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.confirmedRepayments}</div>
                <p className="text-xs text-neutral">Processed repayments</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingRepayments}</div>
                <p className="text-xs text-neutral">Awaiting confirmation</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.pendingAmount.toLocaleString()}</div>
                <p className="text-xs text-neutral">Awaiting confirmation</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Input
                    placeholder="Search by member name or ID..."
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
                    onClick={loadLoansData}
                    className="w-full"
                  >
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loan Repayments List */}
          <Card>
            <CardHeader>
              <CardTitle>Loan Repayments</CardTitle>
              <CardDescription>
                {filteredPayments.length} loan repayment{filteredPayments.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPayments.length > 0 ? (
                <div className="space-y-4">
                  {filteredPayments.map((payment) => (
                    <div key={payment.$id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <TrendingDown className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{payment.memberName}</h4>
                          <p className="text-sm text-neutral">Member ID: {payment.memberId}</p>
                          <p className="text-xs text-neutral">{formatDate(payment.$createdAt)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-bold">${payment.amount}</div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="p-2"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {payment.status === 'Pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="accent"
                                onClick={() => handleLoanAction(payment.$id, 'confirm')}
                                disabled={processingPayment === payment.$id}
                                isLoading={processingPayment === payment.$id}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirm
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleLoanAction(payment.$id, 'reject')}
                                disabled={processingPayment === payment.$id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No loan repayments found</h3>
                  <p className="text-neutral">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No loan repayments have been submitted yet.'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}