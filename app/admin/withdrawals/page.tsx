'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle, XCircle, Clock, Wallet, DollarSign, Users, AlertTriangle, Download, Calendar } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { withdrawalService } from '@/lib/services';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    approvedWithdrawals: 0,
    rejectedWithdrawals: 0,
    totalAmount: 0,
    pendingAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'all'>('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    loadWithdrawalData();
  }, []);

  const loadWithdrawalData = async () => {
    try {
      setLoading(true);
      const [allWithdrawals, pending, withdrawalStats] = await Promise.all([
        withdrawalService.getAllWithdrawals(),
        withdrawalService.getPendingWithdrawals(),
        withdrawalService.getWithdrawalStats()
      ]);
      
      setWithdrawals(allWithdrawals);
      setPendingWithdrawals(pending);
      setStats(withdrawalStats);
    } catch (error) {
      console.error('Error loading withdrawal data:', error);
      toast.error('Failed to load withdrawal data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWithdrawal = async (withdrawalId: string, memberName: string, amount: number) => {
    const confirmApproval = () => new Promise((resolve) => {
      toast('💰 Approve Withdrawal?', {
        description: `Approve withdrawal of ₦${amount.toLocaleString()} for ${memberName}? This will automatically deduct the amount from their savings balance.`,
        action: {
          label: 'Approve',
          onClick: () => resolve(true)
        },
        cancel: {
          label: 'Cancel',
          onClick: () => resolve(false)
        },
        duration: 10000
      });
    });
    
    const confirmed = await confirmApproval();
    if (!confirmed) return;

    setProcessingId(withdrawalId);
    try {
      await withdrawalService.approveWithdrawal(withdrawalId, `Withdrawal approved by admin on ${new Date().toLocaleDateString()}`);
      toast.success(`Withdrawal approved! ₦${amount.toLocaleString()} will be processed to ${memberName}'s account.`);
      loadWithdrawalData(); // Refresh data
    } catch (error: any) {
      console.error('Error approving withdrawal:', error);
      toast.error(error.message || 'Failed to approve withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessingId(withdrawalId);
    try {
      await withdrawalService.rejectWithdrawal(withdrawalId, rejectionReason);
      toast.success('Withdrawal rejected successfully');
      setRejectionReason('');
      setRejectingId(null);
      loadWithdrawalData(); // Refresh data
    } catch (error: any) {
      console.error('Error rejecting withdrawal:', error);
      toast.error(error.message || 'Failed to reject withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const downloadWithdrawalReport = () => {
    const csvContent = [
      ['Member Name', 'Membership Number', 'Date', 'Amount', 'Bank Account', 'Status', 'Available Balance', 'Admin Notes'].join(','),
      ...withdrawals.map((withdrawal: any) => [
        withdrawal.memberName,
        withdrawal.membershipNumber || '',
        formatDate(withdrawal.$createdAt),
        `₦${withdrawal.requestedAmount}`,
        `${withdrawal.bankName} - ${withdrawal.accountNumber}`,
        withdrawal.status,
        `₦${withdrawal.availableBalance}`,
        withdrawal.adminNotes || withdrawal.rejectionReason || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `withdrawals_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
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
              <h1 className="text-3xl font-serif font-bold">Withdrawal Management</h1>
              <p className="text-neutral">Review and process savings withdrawal requests</p>
            </div>
            <Button
              variant="outline"
              onClick={downloadWithdrawalReport}
              disabled={withdrawals.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingWithdrawals}</div>
                <p className="text-xs text-neutral">₦{stats.pendingAmount.toLocaleString()} pending</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approvedWithdrawals}</div>
                <p className="text-xs text-neutral">₦{stats.totalAmount.toLocaleString()} processed</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rejectedWithdrawals}</div>
                <p className="text-xs text-neutral">Declined requests</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Wallet className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalWithdrawals}</div>
                <p className="text-xs text-neutral">All time</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg w-fit">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'pending'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-neutral-600 hover:text-primary'
              }`}
              onClick={() => setSelectedTab('pending')}
            >
              Pending ({stats.pendingWithdrawals})
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'all'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-neutral-600 hover:text-primary'
              }`}
              onClick={() => setSelectedTab('all')}
            >
              All Withdrawals ({stats.totalWithdrawals})
            </button>
          </div>

          {/* Withdrawal Requests */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedTab === 'pending' ? 'Pending Withdrawal Requests' : 'All Withdrawal Requests'}
              </CardTitle>
              <CardDescription>
                {selectedTab === 'pending' 
                  ? `${stats.pendingWithdrawals} request${stats.pendingWithdrawals !== 1 ? 's' : ''} awaiting review`
                  : `${stats.totalWithdrawals} total withdrawal request${stats.totalWithdrawals !== 1 ? 's' : ''}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(selectedTab === 'pending' ? pendingWithdrawals : withdrawals).length > 0 ? (
                <div className="space-y-4">
                  {(selectedTab === 'pending' ? pendingWithdrawals : withdrawals).map((withdrawal: any) => (
                    <div key={withdrawal.$id} className="border border-border rounded-lg p-4 hover:bg-neutral-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Wallet className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold">{withdrawal.memberName}</h4>
                              {withdrawal.membershipNumber && (
                                <span className="text-xs px-2 py-1 bg-neutral-100 rounded border">
                                  {withdrawal.membershipNumber}
                                </span>
                              )}
                            </div>
                            <p className="text-lg font-bold text-primary">₦{withdrawal.requestedAmount?.toLocaleString()}</p>
                            <p className="text-sm text-neutral">
                              {withdrawal.bankName} - {withdrawal.accountNumber}
                            </p>
                            <p className="text-sm text-neutral">{withdrawal.accountName}</p>
                            <p className="text-xs text-neutral flex items-center mt-2">
                              <Calendar className="h-3 w-3 mr-1" />
                              Requested: {formatDate(withdrawal.$createdAt)}
                            </p>
                            <p className="text-xs text-neutral">
                              Available balance at request: ₦{withdrawal.availableBalance?.toLocaleString()}
                            </p>
                            {withdrawal.processedAt && (
                              <p className="text-xs text-neutral">
                                Processed: {formatDate(withdrawal.processedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right space-y-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(withdrawal.status)}`}>
                            {withdrawal.status}
                          </span>
                          
                          {withdrawal.status === 'Pending' && (
                            <div className="space-y-2">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() => handleApproveWithdrawal(withdrawal.$id, withdrawal.memberName, withdrawal.requestedAmount)}
                                  disabled={processingId === withdrawal.$id}
                                  isLoading={processingId === withdrawal.$id}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => setRejectingId(withdrawal.$id)}
                                  disabled={processingId !== null}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                              
                              {rejectingId === withdrawal.$id && (
                                <div className="mt-2 p-3 border border-red-200 rounded-md bg-red-50">
                                  <Input
                                    placeholder="Reason for rejection..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="mb-2"
                                  />
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleRejectWithdrawal(withdrawal.$id)}
                                      disabled={processingId === withdrawal.$id}
                                      isLoading={processingId === withdrawal.$id}
                                    >
                                      Confirm Reject
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setRejectingId(null);
                                        setRejectionReason('');
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {withdrawal.adminNotes && (
                            <p className="text-xs text-green-600 max-w-xs">
                              ✓ {withdrawal.adminNotes}
                            </p>
                          )}
                          {withdrawal.rejectionReason && (
                            <p className="text-xs text-red-600 max-w-xs">
                              ✗ {withdrawal.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wallet className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {selectedTab === 'pending' ? 'No pending withdrawals' : 'No withdrawal requests yet'}
                  </h3>
                  <p className="text-neutral">
                    {selectedTab === 'pending' 
                      ? 'All withdrawal requests have been processed'
                      : 'Members haven\'t submitted any withdrawal requests yet'
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