'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DollarSign, Search, CheckCircle, XCircle, Clock, Eye, FileText, Download } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { paymentService, registrationService } from '@/lib/services';
import { databases, appwriteConfig, storage } from '@/lib/appwrite';
import { formatDate } from '@/lib/utils';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.paymentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.bankAccount?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => 
        payment.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const paymentData = await paymentService.getAllPayments();
      setPayments(paymentData);
      setFilteredPayments(paymentData);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAction = async (paymentId: string, action: 'confirm' | 'reject') => {
    try {
      setProcessingPayment(paymentId);
      
      if (action === 'confirm') {
        // Check if this is a registration payment to use special confirmation logic
        const payment = payments.find(p => p.$id === paymentId);
        
        if (payment?.paymentType === 'Registration') {
          // Use registration service for auto-activation
          await registrationService.confirmRegistrationPayment(paymentId);
          alert('Registration payment confirmed! Member has been activated.');
        } else {
          // Regular payment confirmation
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
          alert('Payment confirmed successfully!');
        }
      } else if (action === 'reject') {
        // Reject payment
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
        alert('Payment has been rejected.');
      }
      
      // Refresh payments after action
      await loadPayments();
    } catch (error) {
      console.error(`Error ${action}ing payment:`, error);
      alert(`Failed to ${action} payment. Please try again.`);
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

  const getPaymentTypeDisplay = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const viewPaymentProof = async (proofFileId: string, fileName: string) => {
    try {
      const fileUrl = storage.getFileView(appwriteConfig.storageId, proofFileId);
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Error viewing payment proof:', error);
      alert('Failed to load payment proof. Please try again.');
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
      alert('Failed to download payment proof. Please try again.');
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
              <h1 className="text-3xl font-serif font-bold">Payment Management</h1>
              <p className="text-neutral">Review and confirm member payments</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-neutral">
                Total: {payments.length} payments
              </div>
              <div className="text-sm text-accent font-medium">
                Pending: {payments.filter(p => p.status === 'Pending').length}
              </div>
            </div>
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
                    placeholder="Search by member, type, or bank account..."
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
                    onClick={loadPayments}
                    className="w-full"
                  >
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments List */}
          <div className="grid grid-cols-1 gap-6">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <Card key={payment.$id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{payment.memberName}</h3>
                            <p className="text-sm text-neutral">Member ID: {payment.membershipNumber || payment.memberId}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2 text-accent" />
                              <span className="font-semibold text-lg">₦{payment.amount}</span>
                            </div>
                            <div>
                              <span className="text-sm text-neutral">Payment Type:</span>
                              <p className="font-medium">{getPaymentTypeDisplay(payment.paymentType)}</p>
                            </div>
                            <div>
                              <span className="text-sm text-neutral">Date Submitted:</span>
                              <p className="font-medium">{formatDate(payment.$createdAt)}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm text-neutral">Bank Account:</span>
                              <p className="font-medium">{payment.bankAccount}</p>
                            </div>
                            <div>
                              <span className="text-sm text-neutral">Account Name:</span>
                              <p className="font-medium">{payment.accountName}</p>
                            </div>
                            {payment.description && (
                              <div>
                                <span className="text-sm text-neutral">Description:</span>
                                <p className="font-medium text-sm">{payment.description}</p>
                              </div>
                            )}
                            {payment.proofFileId && (
                              <div>
                                <span className="text-sm text-neutral">Payment Proof:</span>
                                <div className="flex items-center space-x-2 mt-1">
                                  <FileText className="h-4 w-4 text-accent" />
                                  <span className="text-sm font-medium">{payment.proofFileName || 'Payment proof available'}</span>
                                </div>
                                <div className="flex space-x-2 mt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => viewPaymentProof(payment.proofFileId, payment.proofFileName)}
                                    className="text-xs"
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => downloadPaymentProof(payment.proofFileId, payment.proofFileName)}
                                    className="text-xs"
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-3 min-w-[200px]">
                        {payment.status === 'Pending' && (
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="accent"
                              onClick={() => handlePaymentAction(payment.$id, 'confirm')}
                              disabled={processingPayment === payment.$id}
                              className="flex-1"
                            >
                              {processingPayment === payment.$id ? (
                                <Clock className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Confirm
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handlePaymentAction(payment.$id, 'reject')}
                              disabled={processingPayment === payment.$id}
                              className="flex-1"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        
                        {/* <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => }
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button> */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <DollarSign className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No payments found</h3>
                  <p className="text-neutral">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No payment submissions yet.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}