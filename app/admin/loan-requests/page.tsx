'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreditCard, Search, CheckCircle, XCircle, Clock, Eye, DollarSign, User, FileText, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { loansService } from '@/lib/services';
import { formatDate } from '@/lib/utils';

export default function AdminLoanRequestsPage() {
  const [loanRequests, setLoanRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalApprovedAmount: 0,
    pendingAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState<any>(null);
  const [approvalData, setApprovalData] = useState({
    approvedAmount: '',
    notes: ''
  });

  useEffect(() => {
    loadLoanRequests();
  }, []);

  useEffect(() => {
    let filtered = loanRequests;

    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.memberId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => 
        request.status.toLowerCase().replace(' ', '_') === statusFilter.toLowerCase()
      );
    }

    setFilteredRequests(filtered);
  }, [loanRequests, searchTerm, statusFilter]);

  const loadLoanRequests = async () => {
    try {
      setLoading(true);
      const requests = await loansService.getAllLoanRequests();
      
      // Calculate stats
      const totalRequests = requests.length;
      const pendingRequests = requests.filter(r => r.status === 'Pending Review').length;
      const approvedRequests = requests.filter(r => r.status === 'Approved').length;
      const rejectedRequests = requests.filter(r => r.status === 'Rejected').length;
      const totalApprovedAmount = requests
        .filter(r => r.status === 'Approved')
        .reduce((sum, r) => sum + (r.approvedAmount || 0), 0);
      const pendingAmount = requests
        .filter(r => r.status === 'Pending Review')
        .reduce((sum, r) => sum + (r.requestedAmount || 0), 0);

      setLoanRequests(requests);
      setFilteredRequests(requests);
      setStats({
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        totalApprovedAmount,
        pendingAmount
      });
    } catch (error) {
      console.error('Error loading loan requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingRequest(requestId);

      if (action === 'approve') {
        const approvedAmount = parseFloat(approvalData.approvedAmount);
        if (!approvedAmount || approvedAmount <= 0) {
          alert('Please enter a valid approved amount');
          return;
        }

        await loansService.approveLoanRequest(requestId, approvedAmount, approvalData.notes);
        alert('Loan request approved successfully!');
      } else {
        await loansService.rejectLoanRequest(requestId, approvalData.notes);
        alert('Loan request has been rejected.');
      }

      setShowApprovalModal(null);
      setApprovalData({ approvedAmount: '', notes: '' });
      await loadLoanRequests();
    } catch (error) {
      console.error(`Error ${action}ing loan request:`, error);
      alert(`Failed to ${action} loan request. Please try again.`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const openApprovalModal = (request: any, action: 'approve' | 'reject') => {
    setShowApprovalModal({ ...request, action });
    if (action === 'approve') {
      setApprovalData({
        approvedAmount: request.requestedAmount.toString(),
        notes: ''
      });
    } else {
      setApprovalData({ approvedAmount: '', notes: '' });
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

  const calculateMonthlyPayment = (amount: number, months: number) => {
    // Simple calculation without interest for now
    return (amount / months).toFixed(2);
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
              <h1 className="text-3xl font-serif font-bold">Loan Requests</h1>
              <p className="text-neutral">Review and manage member loan applications</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">${stats.totalApprovedAmount.toLocaleString()}</div>
              <div className="text-sm text-neutral">Total Approved Amount</div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRequests}</div>
                <p className="text-xs text-neutral">All loan applications</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                <p className="text-xs text-neutral">Awaiting decision</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approvedRequests}</div>
                <p className="text-xs text-neutral">Active loans</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.pendingAmount.toLocaleString()}</div>
                <p className="text-xs text-neutral">Under review</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Input
                    placeholder="Search by member, purpose..."
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
                    <option value="pending_review">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="fully_repaid">Fully Repaid</option>
                  </select>
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    onClick={loadLoanRequests}
                    className="w-full"
                  >
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loan Requests List */}
          <div className="grid grid-cols-1 gap-6">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <Card key={request.$id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">{request.memberName}</h3>
                              <p className="text-sm text-neutral">Member ID: {request.memberId}</p>
                              <p className="text-xs text-neutral">
                                Submitted: {formatDate(request.submittedAt)}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm text-neutral">Requested Amount:</span>
                              <p className="font-bold text-lg text-blue-600">${request.requestedAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-sm text-neutral">Repayment Period:</span>
                              <p className="font-medium">{request.repaymentPeriod} months</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm text-neutral">Monthly Income:</span>
                              <p className="font-medium">${request.monthlyIncome.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-sm text-neutral">Estimated Monthly Payment:</span>
                              <p className="font-medium">${calculateMonthlyPayment(request.requestedAmount, request.repaymentPeriod)}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {request.guarantor && (
                              <div>
                                <span className="text-sm text-neutral">Guarantor:</span>
                                <p className="font-medium">{request.guarantor}</p>
                                {request.guarantorContact && (
                                  <p className="text-xs text-neutral">{request.guarantorContact}</p>
                                )}
                              </div>
                            )}
                            {request.status === 'Approved' && (
                              <div>
                                <span className="text-sm text-neutral">Outstanding Balance:</span>
                                <p className="font-bold text-red-600">${request.currentBalance?.toLocaleString() || '0'}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm text-neutral">Purpose:</span>
                          <p className="font-medium">{request.purpose}</p>
                        </div>
                        
                        {request.collateral && (
                          <div>
                            <span className="text-sm text-neutral">Collateral:</span>
                            <p className="font-medium">{request.collateral}</p>
                          </div>
                        )}

                        {/* Bank Account Details for Disbursement */}
                        {(request.bankName || request.accountNumber || request.accountName) && (
                          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                              <DollarSign className="h-4 w-4 text-blue-600 mr-2" />
                              <span className="font-semibold text-blue-800">Disbursement Account Details</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              {request.bankName && (
                                <div>
                                  <span className="text-neutral">Bank Name:</span>
                                  <p className="font-medium">{request.bankName}</p>
                                </div>
                              )}
                              {request.accountNumber && (
                                <div>
                                  <span className="text-neutral">Account Number:</span>
                                  <p className="font-medium font-mono">{request.accountNumber}</p>
                                </div>
                              )}
                              {request.accountName && (
                                <div>
                                  <span className="text-neutral">Account Name:</span>
                                  <p className="font-medium">{request.accountName}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {request.adminNotes && (
                          <div className="p-3 bg-neutral-50 rounded-lg">
                            <span className="text-sm text-neutral">Admin Notes:</span>
                            <p className="font-medium text-sm">{request.adminNotes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-3 min-w-[200px]">
                        {request.status === 'Pending Review' && (
                          <div className="flex flex-col space-y-2">
                            <Button 
                              size="sm" 
                              variant="accent"
                              onClick={() => openApprovalModal(request, 'approve')}
                              disabled={processingRequest === request.$id}
                              className="w-full"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openApprovalModal(request, 'reject')}
                              disabled={processingRequest === request.$id}
                              className="w-full"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {/* View full details */}}
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <CreditCard className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No loan requests found</h3>
                  <p className="text-neutral">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No loan applications have been submitted yet.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Approval/Rejection Modal */}
          {showApprovalModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-2xl bg-background border border-border shadow-xl">
                <CardHeader>
                  <CardTitle>
                    {showApprovalModal.action === 'approve' ? 'Approve' : 'Reject'} Loan Request
                  </CardTitle>
                  <CardDescription>
                    {showApprovalModal.memberName} - ${showApprovalModal.requestedAmount.toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {showApprovalModal.action === 'approve' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">Approved Amount ($)</label>
                      <Input
                        type="number"
                        value={approvalData.approvedAmount}
                        onChange={(e) => setApprovalData(prev => ({...prev, approvedAmount: e.target.value}))}
                        placeholder="Enter approved amount"
                        min="1"
                        step="0.01"
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      {showApprovalModal.action === 'approve' ? 'Approval Notes' : 'Rejection Reason'}
                    </label>
                    <textarea
                      value={approvalData.notes}
                      onChange={(e) => setApprovalData(prev => ({...prev, notes: e.target.value}))}
                      rows={4}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                      placeholder={showApprovalModal.action === 'approve' 
                        ? 'Add any conditions or notes for this approval...'
                        : 'Explain why this application is being rejected...'
                      }
                    />
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <Button 
                      onClick={() => handleApproval(showApprovalModal.$id, showApprovalModal.action)}
                      disabled={processingRequest === showApprovalModal.$id}
                      isLoading={processingRequest === showApprovalModal.$id}
                      variant="accent"
                      className={`flex-1 ${
                        showApprovalModal.action === 'reject' 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : ''
                      }`}
                    >
                      Confirm {showApprovalModal.action === 'approve' ? 'Approval' : 'Rejection'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowApprovalModal(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}