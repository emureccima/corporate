'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreditCard, Search, CheckCircle, XCircle, Clock, Eye, DollarSign, TrendingDown, TrendingUp, FileText, Download, User, AlertTriangle, Calendar } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { loansService } from '@/lib/services';
import { databases, appwriteConfig, storage } from '@/lib/appwrite';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminLoansPage() {
  const [activeTab, setActiveTab] = useState<'requests' | 'repayments'>('requests');
  const [loanRequests, setLoanRequests] = useState<any[]>([]);
  const [loanPayments, setLoanPayments] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
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
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState<any>(null);
  const [approvalData, setApprovalData] = useState({
    approvedAmount: '',
    notes: ''
  });
  const [showLoanDetailsModal, setShowLoanDetailsModal] = useState<any>(null);

  useEffect(() => {
    loadLoansData();
  }, []);

  useEffect(() => {
    if (activeTab === 'requests') {
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
    } else {
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
    }
  }, [loanRequests, loanPayments, searchTerm, statusFilter, activeTab]);

  const loadLoansData = async () => {
    try {
      setLoading(true);
      const [requests, payments, loanStats] = await Promise.all([
        loansService.getAllLoanRequests(),
        loansService.getAllLoanPayments(),
        loansService.getLoanStats()
      ]);

      // Calculate request stats
      const totalRequests = requests.length;
      const pendingRequests = requests.filter(r => r.status === 'Pending Review').length;
      const approvedRequests = requests.filter(r => r.status === 'Approved').length;

      setLoanRequests(requests);
      setLoanPayments(payments);
      setFilteredRequests(requests);
      setFilteredPayments(payments);
      setStats({
        ...loanStats,
        totalRequests,
        pendingRequests,
        approvedRequests
      });
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
        await loansService.confirmLoanPayment(paymentId);
        toast.success('Loan repayment confirmed successfully!');
      } else if (action === 'reject') {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.loansCollectionId,
          paymentId,
          {
            status: 'Rejected',
            confirmed: false,
            rejectedAt: new Date().toISOString()
          }
        );
        toast.success('Loan repayment has been rejected.');
      }
      
      // Refresh data after action
      await loadLoansData();
    } catch (error) {
      console.error(`Error ${action}ing loan repayment:`, error);
      toast.error(`Failed to ${action} loan repayment. Please try again.`);
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleRequestApproval = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingRequest(requestId);

      if (action === 'approve') {
        const approvedAmount = parseFloat(approvalData.approvedAmount);
        if (!approvedAmount || approvedAmount <= 0) {
          toast.error('Please enter a valid approved amount');
          return;
        }

        await loansService.approveLoanRequest(requestId, approvedAmount, approvalData.notes);
        toast.success('Loan request approved successfully!');
      } else {
        await loansService.rejectLoanRequest(requestId, approvalData.notes);
        toast.success('Loan request has been rejected.');
      }

      setShowApprovalModal(null);
      setApprovalData({ approvedAmount: '', notes: '' });
      await loadLoansData();
    } catch (error) {
      console.error(`Error ${action}ing loan request:`, error);
      toast.error(`Failed to ${action} loan request. Please try again.`);
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

  const openLoanDetailsModal = (request: any) => {
    setShowLoanDetailsModal(request);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
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

  const viewPaymentProof = async (proofFileId: string, fileName: string) => {
    try {
      const fileUrl = storage.getFileView(appwriteConfig.storageId, proofFileId);
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Error viewing payment proof:', error);
      toast.error('Failed to load payment proof. Please try again.');
    }
  };

  const downloadPaymentProof = async (proofFileId: string, fileName: string) => {
    try {
      const fileUrl = storage.getFileDownload(appwriteConfig.storageId, proofFileId);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.click();
    } catch (error) {
      console.error('Error downloading payment proof:', error);
      toast.error('Failed to download payment proof. Please try again.');
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
              <p className="text-neutral">Manage loan requests and repayments</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {activeTab === 'requests' ? stats.pendingRequests : stats.pendingRepayments}
              </div>
              <div className="text-sm text-neutral">
                {activeTab === 'requests' ? 'Pending Requests' : 'Pending Repayments'}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'requests'
                  ? 'bg-white text-accent shadow-sm'
                  : 'text-neutral-600 hover:text-accent'
              }`}
            >
              Loan Requests ({stats.totalRequests})
            </button>
            <button
              onClick={() => setActiveTab('repayments')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'repayments'
                  ? 'bg-white text-accent shadow-sm'
                  : 'text-neutral-600 hover:text-accent'
              }`}
            >
              Loan Repayments ({stats.totalRepayments})
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeTab === 'requests' ? (
              <>
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
                    <div className="text-2xl font-bold">₦{stats.pendingAmount.toLocaleString()}</div>
                    <p className="text-xs text-neutral">Under review</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
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
                    <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                    <DollarSign className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₦{stats.totalAmount.toLocaleString()}</div>
                    <p className="text-xs text-neutral">Total confirmed</p>
                  </CardContent>
                </Card>
              </>
            )}
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
                    placeholder={activeTab === 'requests' ? "Search by member, purpose..." : "Search by member name or ID..."}
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
                    {activeTab === 'requests' ? (
                      <>
                        <option value="pending_review">Pending Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="fully_repaid">Fully Repaid</option>
                      </>
                    ) : (
                      <>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="rejected">Rejected</option>
                      </>
                    )}
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

          {/* Content based on active tab */}
          {activeTab === 'requests' ? (
            /* Loan Requests */
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
                                <p className="text-sm text-neutral">Member ID: {request.membershipNumber || request.memberId}</p>
                                <p className="text-xs text-neutral">
                                  Submitted: {formatDate(request.submittedAt || request.$createdAt)}
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
                                <p className="font-bold text-lg text-blue-600">₦{request.requestedAmount.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-sm text-neutral">Repayment Period:</span>
                                <p className="font-medium">{request.repaymentPeriod} months</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm text-neutral">Monthly Income:</span>
                                <p className="font-medium">₦{request.monthlyIncome.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-sm text-neutral">Estimated Monthly Payment:</span>
                                <p className="font-medium">₦{(request.requestedAmount / request.repaymentPeriod).toFixed(2)}</p>
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
                                  <p className="font-bold text-red-600">₦{request.currentBalance?.toLocaleString() || '0'}</p>
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
          ) : (
            /* Loan Repayments */
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
                            <p className="text-sm text-neutral">Member ID: {payment.membershipNumber || payment.memberId}</p>
                            <p className="text-xs text-neutral">{formatDate(payment.$createdAt)}</p>
                            {payment.proofFileId && (
                              <div className="flex items-center mt-1">
                                <FileText className="h-3 w-3 text-accent mr-1" />
                                <span className="text-xs text-accent">Proof attached</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-lg font-bold">₦{payment.amount}</div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </div>
                          
                          <div className="flex space-x-2">
                            {payment.proofFileId ? (
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => viewPaymentProof(payment.proofFileId, payment.proofFileName)}
                                  className="p-2"
                                  title="View proof"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => downloadPaymentProof(payment.proofFileId, payment.proofFileName)}
                                  className="p-2"
                                  title="Download proof"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="p-2"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            
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
          )}

          {/* Approval/Rejection Modal */}
          {showApprovalModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-2xl bg-background border border-border shadow-xl">
                <CardHeader>
                  <CardTitle>
                    {showApprovalModal.action === 'approve' ? 'Approve' : 'Reject'} Loan Request
                  </CardTitle>
                  <CardDescription>
                    {showApprovalModal.memberName} - ₦{showApprovalModal.requestedAmount.toLocaleString()}
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
                      onClick={() => handleRequestApproval(showApprovalModal.$id, showApprovalModal.action)}
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

          {/* Loan Details Modal */}
          {showLoanDetailsModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-4xl bg-background border border-border shadow-xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="sticky top-0 bg-background border-b z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Loan Request Details</CardTitle>
                      <CardDescription>
                        {showLoanDetailsModal.memberName} - {showLoanDetailsModal.membershipNumber || showLoanDetailsModal.memberId}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowLoanDetailsModal(null)}
                      className="rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Request Information */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-accent" />
                          Request Information
                        </h3>
                        <div className="space-y-4 bg-neutral-50 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-neutral">Requested Amount</p>
                              <p className="text-2xl font-bold text-blue-600">
                                ₦{showLoanDetailsModal.requestedAmount?.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-neutral">Repayment Period</p>
                              <p className="text-xl font-semibold">
                                {showLoanDetailsModal.repaymentPeriod} months
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-neutral">Purpose</p>
                            <p className="font-medium">{showLoanDetailsModal.purpose}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-neutral">Monthly Income</p>
                              <p className="font-semibold text-green-600">
                                ₦{showLoanDetailsModal.monthlyIncome?.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-neutral">Est. Monthly Payment</p>
                              <p className="font-semibold">
                                ₦{((showLoanDetailsModal.requestedAmount || 0) / (showLoanDetailsModal.repaymentPeriod || 1)).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {showLoanDetailsModal.collateral && (
                            <div>
                              <p className="text-sm text-neutral">Collateral</p>
                              <p className="font-medium">{showLoanDetailsModal.collateral}</p>
                            </div>
                          )}

                          {showLoanDetailsModal.guarantor && (
                            <div>
                              <p className="text-sm text-neutral">Guarantor</p>
                              <p className="font-medium">{showLoanDetailsModal.guarantor}</p>
                              {showLoanDetailsModal.guarantorContact && (
                                <p className="text-sm text-neutral">{showLoanDetailsModal.guarantorContact}</p>
                              )}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-neutral">Submitted Date</p>
                              <p className="font-medium">
                                {formatDate(showLoanDetailsModal.submittedAt || showLoanDetailsModal.$createdAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-neutral">Status</p>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium border inline-block ${getStatusColor(showLoanDetailsModal.status)}`}>
                                {showLoanDetailsModal.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bank Account Details */}
                      {(showLoanDetailsModal.bankName || showLoanDetailsModal.accountNumber || showLoanDetailsModal.accountName) && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                            Disbursement Account
                          </h3>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="space-y-3">
                              {showLoanDetailsModal.bankName && (
                                <div>
                                  <p className="text-sm text-green-700">Bank Name</p>
                                  <p className="font-bold text-green-800">{showLoanDetailsModal.bankName}</p>
                                </div>
                              )}
                              {showLoanDetailsModal.accountNumber && (
                                <div>
                                  <p className="text-sm text-green-700">Account Number</p>
                                  <p className="font-bold text-green-800 font-mono text-lg">
                                    {showLoanDetailsModal.accountNumber}
                                  </p>
                                </div>
                              )}
                              {showLoanDetailsModal.accountName && (
                                <div>
                                  <p className="text-sm text-green-700">Account Name</p>
                                  <p className="font-bold text-green-800">{showLoanDetailsModal.accountName}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Approval Information */}
                    <div className="space-y-6">
                      {showLoanDetailsModal.status === 'Approved' && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                            Approval Details
                          </h3>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-green-700">Approved Amount</p>
                                <p className="text-2xl font-bold text-green-800">
                                  ₦{showLoanDetailsModal.approvedAmount?.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-green-700">Outstanding Balance</p>
                                <p className="text-2xl font-bold text-red-600">
                                  ₦{(showLoanDetailsModal.currentBalance || 0).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-green-700">Approval Date</p>
                              <p className="font-medium">
                                {showLoanDetailsModal.approvedAt ? formatDate(showLoanDetailsModal.approvedAt) : 'N/A'}
                              </p>
                            </div>
                            
                            {showLoanDetailsModal.lastRepaymentDate && (
                              <div>
                                <p className="text-sm text-green-700">Last Repayment</p>
                                <p className="font-medium">{formatDate(showLoanDetailsModal.lastRepaymentDate)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Admin Notes */}
                      {showLoanDetailsModal.adminNotes && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-accent" />
                            Admin Notes
                          </h3>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="font-medium text-blue-800">{showLoanDetailsModal.adminNotes}</p>
                          </div>
                        </div>
                      )}

                      {/* Risk Assessment */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2 text-accent" />
                          Risk Assessment
                        </h3>
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-neutral">Debt-to-Income Ratio</p>
                              <p className="font-bold text-lg">
                                {((((showLoanDetailsModal.requestedAmount || 0) / (showLoanDetailsModal.repaymentPeriod || 1)) / (showLoanDetailsModal.monthlyIncome || 1)) * 100).toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-neutral">Risk Level</p>
                              <span className={`px-2 py-1 rounded text-sm font-medium ${
                                ((((showLoanDetailsModal.requestedAmount || 0) / (showLoanDetailsModal.repaymentPeriod || 1)) / (showLoanDetailsModal.monthlyIncome || 1)) * 100) > 30
                                  ? 'bg-red-100 text-red-800'
                                  : ((((showLoanDetailsModal.requestedAmount || 0) / (showLoanDetailsModal.repaymentPeriod || 1)) / (showLoanDetailsModal.monthlyIncome || 1)) * 100) > 20
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {((((showLoanDetailsModal.requestedAmount || 0) / (showLoanDetailsModal.repaymentPeriod || 1)) / (showLoanDetailsModal.monthlyIncome || 1)) * 100) > 30 ? 'High' : 
                                 ((((showLoanDetailsModal.requestedAmount || 0) / (showLoanDetailsModal.repaymentPeriod || 1)) / (showLoanDetailsModal.monthlyIncome || 1)) * 100) > 20 ? 'Medium' : 'Low'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-sm text-neutral">
                            <p className="font-medium">Assessment Notes:</p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>Monthly payment: ₦{((showLoanDetailsModal.requestedAmount || 0) / (showLoanDetailsModal.repaymentPeriod || 1)).toFixed(2)}</li>
                              <li>Payment represents {((((showLoanDetailsModal.requestedAmount || 0) / (showLoanDetailsModal.repaymentPeriod || 1)) / (showLoanDetailsModal.monthlyIncome || 1)) * 100).toFixed(1)}% of monthly income</li>
                              <li>{showLoanDetailsModal.guarantor ? 'Has guarantor' : 'No guarantor provided'}</li>
                              <li>{showLoanDetailsModal.collateral ? 'Collateral provided' : 'No collateral'}</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {showLoanDetailsModal.status === 'Pending Review' && (
                        <div className="space-y-3">
                          <Button
                            onClick={() => {
                              openApprovalModal(showLoanDetailsModal, 'approve');
                              setShowLoanDetailsModal(null);
                            }}
                            variant="accent"
                            className="w-full"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve This Loan
                          </Button>
                          <Button
                            onClick={() => {
                              openApprovalModal(showLoanDetailsModal, 'reject');
                              setShowLoanDetailsModal(null);
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject This Loan
                          </Button>
                        </div>
                      )}
                    </div>
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