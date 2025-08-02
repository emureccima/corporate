'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreditCard, Plus, DollarSign, Clock, CheckCircle, AlertTriangle, TrendingDown, Calendar, FileText, Download } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { loansService } from '@/lib/services';
import { formatDate } from '@/lib/utils';

export default function MemberLoansPage() {
  const { user } = useAuth();
  const [loanSummary, setLoanSummary] = useState<any>({
    totalBorrowed: 0,
    totalOutstanding: 0,
    totalRepaid: 0,
    activeLoans: 0,
    totalLoans: 0,
    pendingRequests: 0,
    loanRequests: [],
    repayments: []
  });
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loanFormData, setLoanFormData] = useState({
    requestedAmount: '',
    purpose: '',
    repaymentPeriod: '12',
    monthlyIncome: '',
    collateral: '',
    guarantor: '',
    guarantorContact: '',
    bankName: '',
    accountNumber: '',
    accountName: ''
  });

  useEffect(() => {
    if (user?.memberId) {
      loadLoanData();
    }
  }, [user?.memberId]);

  const loadLoanData = async () => {
    if (!user?.memberId) return;
    
    try {
      setLoading(true);
      const summary = await loansService.getMemberLoanSummary(user.memberId);
      setLoanSummary(summary);
    } catch (error) {
      console.error('Error loading loan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLoanFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitLoanRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.memberId || !user?.name) return;

    setSubmitting(true);
    try {
      await loansService.submitLoanRequest({
        memberId: user.memberId,
        memberName: user.name,
        requestedAmount: parseFloat(loanFormData.requestedAmount),
        purpose: loanFormData.purpose,
        repaymentPeriod: parseInt(loanFormData.repaymentPeriod),
        monthlyIncome: parseFloat(loanFormData.monthlyIncome),
        collateral: loanFormData.collateral || undefined,
        guarantor: loanFormData.guarantor || undefined,
        guarantorContact: loanFormData.guarantorContact || undefined,
        bankName: loanFormData.bankName,
        accountNumber: loanFormData.accountNumber,
        accountName: loanFormData.accountName
      });

      alert('Loan request submitted successfully! You will be notified once it is reviewed.');
      setShowLoanForm(false);
      setLoanFormData({
        requestedAmount: '',
        purpose: '',
        repaymentPeriod: '12',
        monthlyIncome: '',
        collateral: '',
        guarantor: '',
        guarantorContact: '',
        bankName: '',
        accountNumber: '',
        accountName: ''
      });
      loadLoanData(); // Refresh data
    } catch (error) {
      console.error('Error submitting loan request:', error);
      alert('Failed to submit loan request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'fully repaid':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const downloadLoanReport = () => {
    const csvContent = [
      ['Type', 'Date', 'Amount', 'Status', 'Description'].join(','),
      // Loan requests
      ...loanSummary.loanRequests.map((loan: any) => [
        'Loan Request',
        formatDate(loan.$createdAt),
        `₦${loan.requestedAmount}`,
        loan.status,
        `Purpose: ${loan.purpose}`
      ].join(',')),
      // Repayments
      ...loanSummary.repayments.map((repayment: any) => [
        'Repayment',
        formatDate(repayment.$createdAt),
        `₦${repayment.amount}`,
        repayment.status,
        repayment.description || 'Loan repayment'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user?.name}_loan_report_${new Date().toISOString().split('T')[0]}.csv`;
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
              <h1 className="text-3xl font-serif font-bold">My Loans</h1>
              <p className="text-neutral">Manage your loan requests and track repayments</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">
                ₦{loanSummary.totalOutstanding.toLocaleString()}
              </div>
              <div className="text-sm text-neutral">Outstanding Balance</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-800 text-lg">Need financial assistance?</h3>
                <p className="text-sm text-blue-700">Apply for a loan from the cooperative</p>
              </div>
              <Button 
                variant="accent" 
                size="lg" 
                onClick={() => setShowLoanForm(true)}
                className="shadow-lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Request Loan
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{loanSummary.totalOutstanding.toLocaleString()}</div>
                <p className="text-xs text-neutral">Amount owed</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
                <CreditCard className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{loanSummary.totalBorrowed.toLocaleString()}</div>
                <p className="text-xs text-neutral">Lifetime borrowing</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Repaid</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{loanSummary.totalRepaid.toLocaleString()}</div>
                <p className="text-xs text-neutral">Confirmed payments</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                <TrendingDown className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loanSummary.activeLoans}</div>
                <p className="text-xs text-neutral">Current loans</p>
              </CardContent>
            </Card>
          </div>

          {/* Loan Request Form Modal */}
          {showLoanForm && (
            <Card className="border-2 border-accent">
              <CardHeader>
                <CardTitle>Loan Application</CardTitle>
                <CardDescription>Fill out the form below to request a loan</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitLoanRequest} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Requested Amount (₦)</label>
                      <Input
                        type="number"
                        name="requestedAmount"
                        value={loanFormData.requestedAmount}
                        onChange={handleInputChange}
                        min="100"
                        step="0.01"
                        required
                        placeholder="Enter amount needed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Repayment Period (months)</label>
                      <select
                        name="repaymentPeriod"
                        value={loanFormData.repaymentPeriod}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                      >
                        <option value="6">6 months</option>
                        <option value="12">12 months</option>
                        <option value="18">18 months</option>
                        <option value="24">24 months</option>
                        <option value="36">36 months</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Monthly Income (₦)</label>
                      <Input
                        type="number"
                        name="monthlyIncome"
                        value={loanFormData.monthlyIncome}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        required
                        placeholder="Your monthly income"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Guarantor Name</label>
                      <Input
                        type="text"
                        name="guarantor"
                        value={loanFormData.guarantor}
                        onChange={handleInputChange}
                        placeholder="Guarantor's full name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Purpose of Loan</label>
                    <textarea
                      name="purpose"
                      value={loanFormData.purpose}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="Describe what you will use the loan for..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Collateral (Optional)</label>
                    <Input
                      type="text"
                      name="collateral"
                      value={loanFormData.collateral}
                      onChange={handleInputChange}
                      placeholder="Assets offered as security"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Guarantor Contact</label>
                    <Input
                      type="text"
                      name="guarantorContact"
                      value={loanFormData.guarantorContact}
                      onChange={handleInputChange}
                      placeholder="Guarantor's phone or email"
                    />
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <h4 className="font-semibold text-sm text-accent">Bank Account Details for Disbursement</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Bank Name *</label>
                        <Input
                          type="text"
                          name="bankName"
                          value={loanFormData.bankName}
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
                          value={loanFormData.accountNumber}
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
                        value={loanFormData.accountName}
                        onChange={handleInputChange}
                        required
                        placeholder="Account holder name (as shown on bank statement)"
                      />
                    </div>
                    <p className="text-xs text-neutral">
                      These details will be used to disburse the loan amount upon approval. Please ensure all information is accurate.
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      isLoading={submitting}
                      className="flex-1"
                    >
                      Submit Application
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowLoanForm(false)}
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
                Loan History
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadLoanReport}
                  disabled={loanSummary.loanRequests.length === 0 && loanSummary.repayments.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Loan Requests */}
          <Card>
            <CardHeader>
              <CardTitle>My Loan Requests</CardTitle>
              <CardDescription>
                {loanSummary.loanRequests.length} loan request{loanSummary.loanRequests.length !== 1 ? 's' : ''} submitted
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loanSummary.loanRequests.length > 0 ? (
                <div className="space-y-4">
                  {loanSummary.loanRequests.map((loan: any) => (
                    <div key={loan.$id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">₦{loan.requestedAmount?.toLocaleString()}</h4>
                          <p className="text-sm text-neutral">{loan.purpose}</p>
                          <p className="text-xs text-neutral flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Requested: {formatDate(loan.$createdAt)}
                          </p>
                          {loan.status === 'Approved' && (
                            <p className="text-xs text-green-600">
                              Balance: ₦{loan.currentBalance?.toLocaleString() || '0'}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(loan.status)}`}>
                          {loan.status}
                        </span>
                        {loan.approvedAt && (
                          <p className="text-xs text-neutral mt-1">
                            Approved: {formatDate(loan.approvedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No loan requests yet</h3>
                  <p className="text-neutral mb-4">Apply for your first loan to get started</p>
                  <Button variant="accent" onClick={() => setShowLoanForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Request First Loan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Repayment History */}
          <Card>
            <CardHeader>
              <CardTitle>Repayment History</CardTitle>
              <CardDescription>
                {loanSummary.repayments.length} repayment{loanSummary.repayments.length !== 1 ? 's' : ''} made
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loanSummary.repayments.length > 0 ? (
                <div className="space-y-4">
                  {loanSummary.repayments.map((repayment: any) => (
                    <div key={repayment.$id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <TrendingDown className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">₦{repayment.amount}</h4>
                          <p className="text-sm text-neutral">
                            {repayment.description || 'Loan repayment'}
                          </p>
                          <p className="text-xs text-neutral flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(repayment.$createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          repayment.status === 'Confirmed' 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : repayment.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {repayment.status}
                        </span>
                        {repayment.status === 'Confirmed' && repayment.confirmedAt && (
                          <p className="text-xs text-neutral mt-1">
                            Confirmed: {formatDate(repayment.confirmedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No repayments yet</h3>
                  <p className="text-neutral">
                    Once you have an approved loan, you can make repayments through the payments page
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