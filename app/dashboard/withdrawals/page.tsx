'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreditCard, Plus, DollarSign, Clock, CheckCircle, XCircle, Calendar, Download, Wallet } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { withdrawalService } from '@/lib/services';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function WithdrawalsPage() {
  const { user } = useAuth();
  const [savingsBalance, setSavingsBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawalFormData, setWithdrawalFormData] = useState({
    requestedAmount: '',
    accountNumber: '',
    accountName: '',
    bankName: ''
  });

  useEffect(() => {
    if (user?.memberId) {
      loadWithdrawalData();
    }
  }, [user?.memberId]);

  const loadWithdrawalData = async () => {
    if (!user?.memberId) return;
    
    try {
      setLoading(true);
      const [balance, memberWithdrawals] = await Promise.all([
        withdrawalService.getMemberSavingsBalance(user.memberId),
        withdrawalService.getMemberWithdrawals(user.memberId)
      ]);
      
      setSavingsBalance(balance);
      setWithdrawals(memberWithdrawals);
    } catch (error) {
      console.error('Error loading withdrawal data:', error);
      toast.error('Failed to load withdrawal data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWithdrawalFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.memberId || !user?.name) return;

    // Validate active status
    if (user?.status !== 'Active') {
      toast.error('Your membership must be active to request withdrawals');
      return;
    }

    const amount = parseFloat(withdrawalFormData.requestedAmount);
    
    // Validate amount
    if (amount <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }

    if (amount > savingsBalance) {
      toast.error(`Insufficient funds. Available balance: ₦${savingsBalance.toLocaleString()}`);
      return;
    }

    setSubmitting(true);
    try {
      await withdrawalService.requestWithdrawal({
        memberId: user.memberId,
        memberName: user.name,
        membershipNumber: user.membershipNumber,
        requestedAmount: amount,
        accountNumber: withdrawalFormData.accountNumber,
        accountName: withdrawalFormData.accountName,
        bankName: withdrawalFormData.bankName
      });

      toast.success('Withdrawal request submitted successfully! Please wait for admin approval.');
      setShowWithdrawalForm(false);
      setWithdrawalFormData({
        requestedAmount: '',
        accountNumber: '',
        accountName: '',
        bankName: ''
      });
      loadWithdrawalData(); // Refresh data
    } catch (error: any) {
      console.error('Error submitting withdrawal:', error);
      toast.error(error.message || 'Failed to submit withdrawal request');
    } finally {
      setSubmitting(false);
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
      ['Date', 'Amount', 'Bank Account', 'Status', 'Notes'].join(','),
      ...withdrawals.map((withdrawal: any) => [
        formatDate(withdrawal.$createdAt),
        `₦${withdrawal.requestedAmount}`,
        `${withdrawal.bankName} - ${withdrawal.accountNumber}`,
        withdrawal.status,
        withdrawal.adminNotes || withdrawal.rejectionReason || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user?.name}_withdrawals_${new Date().toISOString().split('T')[0]}.csv`;
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
              <h1 className="text-3xl font-serif font-bold">Savings Withdrawals</h1>
              <p className="text-neutral">Request withdrawals from your savings account</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ₦{savingsBalance.toLocaleString()}
              </div>
              <div className="text-sm text-neutral">Available Balance</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800 text-lg">Need to withdraw your savings?</h3>
                <p className="text-sm text-green-700">Request a withdrawal to your bank account</p>
              </div>
              {user?.status === 'Active' && savingsBalance > 0 ? (
                <Button 
                  variant="accent" 
                  size="lg" 
                  onClick={() => setShowWithdrawalForm(true)}
                  className="shadow-lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Request Withdrawal
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button 
                    variant="accent" 
                    size="lg" 
                    disabled
                    className="shadow-lg opacity-50"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Request Withdrawal
                  </Button>
                  <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200 max-w-xs">
                    {user?.status !== 'Active' 
                      ? '⚠️ Membership must be active'
                      : '⚠️ No savings balance available'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Withdrawal Request Form */}
          {showWithdrawalForm && (
            <Card className="border-2 border-accent">
              <CardHeader>
                <CardTitle>Withdrawal Request</CardTitle>
                <CardDescription>
                  Available balance: ₦{savingsBalance.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Withdrawal Amount (₦)</label>
                    <Input
                      type="number"
                      name="requestedAmount"
                      value={withdrawalFormData.requestedAmount}
                      onChange={handleInputChange}
                      min="1"
                      max={savingsBalance}
                      step="0.01"
                      required
                      placeholder="Enter amount to withdraw"
                    />
                    <p className="text-xs text-neutral mt-1">
                      Maximum: ₦{savingsBalance.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="border-t pt-4 space-y-4">
                    <h4 className="font-semibold text-sm text-accent">Bank Account Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Bank Name *</label>
                        <Input
                          type="text"
                          name="bankName"
                          value={withdrawalFormData.bankName}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter your bank name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Account Number *</label>
                        <Input
                          type="text"
                          name="accountNumber"
                          value={withdrawalFormData.accountNumber}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter account number"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Account Name *</label>
                      <Input
                        type="text"
                        name="accountName"
                        value={withdrawalFormData.accountName}
                        onChange={handleInputChange}
                        required
                        placeholder="Account holder name (as shown on bank statement)"
                      />
                    </div>
                    <p className="text-xs text-neutral">
                      Ensure all bank details are correct. Funds will be transferred to this account upon approval.
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      isLoading={submitting}
                      className="flex-1"
                    >
                      Submit Request
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowWithdrawalForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Download Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Withdrawal History
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadWithdrawalReport}
                  disabled={withdrawals.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Withdrawal History */}
          <Card>
            <CardHeader>
              <CardTitle>My Withdrawal Requests</CardTitle>
              <CardDescription>
                {withdrawals.length} withdrawal request{withdrawals.length !== 1 ? 's' : ''} submitted
              </CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawals.length > 0 ? (
                <div className="space-y-4">
                  {withdrawals.map((withdrawal: any) => (
                    <div key={withdrawal.$id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Wallet className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">₦{withdrawal.requestedAmount?.toLocaleString()}</h4>
                          <p className="text-sm text-neutral">
                            {withdrawal.bankName} - {withdrawal.accountNumber}
                          </p>
                          <p className="text-xs text-neutral flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Requested: {formatDate(withdrawal.$createdAt)}
                          </p>
                          {withdrawal.processedAt && (
                            <p className="text-xs text-neutral">
                              Processed: {formatDate(withdrawal.processedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(withdrawal.status)}`}>
                          {withdrawal.status}
                        </span>
                        {withdrawal.adminNotes && (
                          <p className="text-xs text-neutral mt-1 max-w-xs">
                            {withdrawal.adminNotes}
                          </p>
                        )}
                        {withdrawal.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1 max-w-xs">
                            {withdrawal.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wallet className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No withdrawal requests yet</h3>
                  <p className="text-neutral mb-4">
                    {savingsBalance > 0 
                      ? 'Request your first withdrawal to get started'
                      : 'Start saving money first to make withdrawals'
                    }
                  </p>
                  {user?.status === 'Active' && savingsBalance > 0 ? (
                    <Button variant="accent" onClick={() => setShowWithdrawalForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Request First Withdrawal
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button variant="accent" disabled className="opacity-50">
                        <Plus className="h-4 w-4 mr-2" />
                        Request First Withdrawal
                      </Button>
                      <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                        {user?.status !== 'Active' 
                          ? '⚠️ Membership must be active'
                          : '⚠️ No savings balance available'
                        }
                      </p>
                    </div>
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