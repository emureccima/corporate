'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserPlus, CheckCircle, XCircle, Clock, DollarSign, Eye, AlertTriangle, FileText, Download } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { registrationService } from '@/lib/services';
import { storage, appwriteConfig } from '@/lib/appwrite';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface RegistrationPayment {
  $id: string;
  memberId: string;
  memberName: string;
  membershipNumber?: string;
  amount: number;
  bankAccountNumber: string;
  transferType: string;
  status: 'Pending' | 'Confirmed' | 'Rejected';
  description?: string;
  rejectionReason?: string;
  paymentProofFileId?: string;
  paymentProofFileName?: string;
  $createdAt: string;
}

export default function AdminRegistrationsPage() {
  const [payments, setPayments] = useState<RegistrationPayment[]>([]);
  const [stats, setStats] = useState({
    totalPayments: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    rejectedPayments: 0,
    totalAmount: 0,
    pendingAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<RegistrationPayment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadRegistrationData();
  }, []);

  const loadRegistrationData = async () => {
    try {
      setLoading(true);
      const [allPayments, registrationStats] = await Promise.all([
        registrationService.getAllRegistrationPayments(),
        registrationService.getRegistrationStats()
      ]);
      
      console.log('Loaded payments:', allPayments);
      setPayments(allPayments as RegistrationPayment[]);
      setStats(registrationStats);
    } catch (error) {
      console.error('Error loading registration data:', error);
      toast.error('Failed to load registration data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId: string, memberName: string) => {
    try {
      setActionLoading(paymentId);
      await registrationService.approveRegistrationPayment(paymentId, 'Registration payment approved by admin');
      toast.success(`Registration payment approved for ${memberName}`);
      await loadRegistrationData();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error approving payment:', error);
      toast.error('Failed to approve payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (paymentId: string, memberName: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setActionLoading(paymentId);
      await registrationService.rejectRegistrationPayment(paymentId, reason);
      toast.success(`Registration payment rejected for ${memberName}`);
      await loadRegistrationData();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('Failed to reject payment');
    } finally {
      setActionLoading(null);
    }
  };

  const openDetails = (payment: RegistrationPayment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-serif font-bold">Registration Management</h1>
              <p className="text-neutral">Manage and approve registration fee payments</p>
            </div>
            <Button onClick={loadRegistrationData} variant="outline">
              Refresh Data
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPayments}</div>
                <p className="text-xs text-neutral">All registration payments</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                <p className="text-xs text-neutral">₦{stats.pendingAmount.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approvedPayments}</div>
                <p className="text-xs text-neutral">₦{stats.totalAmount.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rejectedPayments}</div>
                <p className="text-xs text-neutral">Need review</p>
              </CardContent>
            </Card>
          </div>

          {/* Registration Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="mr-2 h-5 w-5" />
                Registration Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Member</th>
                        <th className="text-left p-2">Amount</th>
                        <th className="text-left p-2">Payment Proof</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.$id} className="border-b border-border hover:bg-gray-50">
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{payment.memberName}</p>
                              <p className="text-sm text-neutral">{payment.membershipNumber}</p>
                            </div>
                          </td>
                          <td className="p-2 font-mono">₦{payment.amount.toLocaleString()}</td>
                          <td className="p-2">
                            {payment.paymentProofFileName ? (
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <div className="text-sm">
                                  <p className="font-medium truncate max-w-32">{payment.paymentProofFileName}</p>
                                  <div className="flex space-x-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => viewPaymentProof(payment.paymentProofFileId!, payment.paymentProofFileName!)}
                                      className="text-xs px-2 py-1 h-6"
                                    >
                                      View
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => downloadPaymentProof(payment.paymentProofFileId!, payment.paymentProofFileName!)}
                                      className="text-xs px-2 py-1 h-6"
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">No proof uploaded</span>
                            )}
                          </td>
                          <td className="p-2 text-sm">{formatDate(payment.$createdAt)}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              payment.status === 'Confirmed'
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openDetails(payment)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {payment.status === 'Pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApprove(payment.$id, payment.memberName)}
                                    disabled={actionLoading === payment.$id}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReject(payment.$id, payment.memberName)}
                                    disabled={actionLoading === payment.$id}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserPlus className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Registration Payments</h3>
                  <p className="text-neutral">No registration fee payments have been submitted yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Details Modal */}
          {showDetailsModal && selectedPayment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Member Name</label>
                    <p className="font-medium">{selectedPayment.memberName}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Membership Number</label>
                    <p className="font-medium">{selectedPayment.membershipNumber}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Amount</label>
                    <p className="font-mono text-lg">₦{selectedPayment.amount.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Bank Account</label>
                    <p className="font-mono">{selectedPayment.bankAccountNumber}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Transfer Type</label>
                    <p>{selectedPayment.transferType}</p>
                  </div>
                  
                  {selectedPayment.paymentProofFileName && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Payment Proof</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{selectedPayment.paymentProofFileName}</span>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewPaymentProof(selectedPayment.paymentProofFileId!, selectedPayment.paymentProofFileName!)}
                            className="text-xs"
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadPaymentProof(selectedPayment.paymentProofFileId!, selectedPayment.paymentProofFileName!)}
                            className="text-xs"
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      selectedPayment.status === 'Confirmed'
                        ? 'bg-green-100 text-green-800'
                        : selectedPayment.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Submitted</label>
                    <p>{formatDate(selectedPayment.$createdAt)}</p>
                  </div>
                  
                  {selectedPayment.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Notes</label>
                      <p className="text-sm">{selectedPayment.description}</p>
                    </div>
                  )}
                  
                  {selectedPayment.rejectionReason && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Rejection Reason</label>
                      <p className="text-sm text-red-600">{selectedPayment.rejectionReason}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 mt-6">
                  {selectedPayment.status === 'Pending' && (
                    <>
                      <Button
                        onClick={() => handleApprove(selectedPayment.$id, selectedPayment.memberName)}
                        disabled={actionLoading === selectedPayment.$id}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleReject(selectedPayment.$id, selectedPayment.memberName)}
                        disabled={actionLoading === selectedPayment.$id}
                        className="flex-1 text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}