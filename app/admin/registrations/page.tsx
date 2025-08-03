'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UserPlus, DollarSign, Clock, CheckCircle, Search, Eye, Filter } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { registrationService } from '@/lib/services';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminRegistrationsPage() {
  const [registrationPayments, setRegistrationPayments] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    confirmedRegistrations: 0,
    pendingRegistrations: 0,
    totalAmount: 0,
    pendingAmount: 0,
    registrationFee: 50
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    loadRegistrationData();
  }, []);

  useEffect(() => {
    let filtered = registrationPayments;

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
  }, [registrationPayments, searchTerm, statusFilter]);

  const loadRegistrationData = async () => {
    try {
      setLoading(true);
      const [payments, registrationStats] = await Promise.all([
        registrationService.getRegistrationPayments(),
        registrationService.getRegistrationStats()
      ]);

      setRegistrationPayments(payments);
      setFilteredPayments(payments);
      setStats(registrationStats);
    } catch (error) {
      console.error('Error loading registration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRegistration = async (paymentId: string) => {
    try {
      setProcessingPayment(paymentId);
      await registrationService.confirmRegistrationPayment(paymentId);
      
      // Show success message
      toast.success('Registration fee confirmed! Member has been activated.');
      
      // Reload data
      await loadRegistrationData();
    } catch (error) {
      console.error('Error confirming registration:', error);
      toast.error('Failed to confirm registration. Please try again.');
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
              <h1 className="text-3xl font-serif font-bold">Registration Fee Management</h1>
              <p className="text-neutral">Track and manage member registration fee payments</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-accent">₦{stats.registrationFee}</div>
              <div className="text-sm text-neutral">Current Registration Fee</div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                <UserPlus className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
                <p className="text-xs text-neutral">All registration payments</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.confirmedRegistrations}</div>
                <p className="text-xs text-neutral">Active members</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingRegistrations}</div>
                <p className="text-xs text-neutral">Awaiting confirmation</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{stats.totalAmount.toLocaleString()}</div>
                <p className="text-xs text-neutral">Confirmed payments</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{stats.pendingAmount.toLocaleString()}</div>
                <p className="text-xs text-neutral">Awaiting confirmation</p>
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
                    onClick={loadRegistrationData}
                    className="w-full"
                  >
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration Payments List */}
          <Card>
            <CardHeader>
              <CardTitle>Registration Fee Payments</CardTitle>
              <CardDescription>
                {filteredPayments.length} registration payment{filteredPayments.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPayments.length > 0 ? (
                <div className="space-y-4">
                  {filteredPayments.map((payment) => (
                    <div key={payment.$id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                          <UserPlus className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{payment.memberName}</h4>
                          <p className="text-sm text-neutral">Member ID: {payment.membershipNumber || payment.memberId}</p>
                          {/* Debug info */}
                          <p className="text-xs text-gray-400">Debug: membershipNumber={payment.membershipNumber}, memberId={payment.memberId}</p>
                          <p className="text-xs text-neutral">{formatDate(payment.$createdAt)}</p>
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
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {/* View payment details */}}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {payment.status === 'Pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="accent"
                                onClick={() => handleConfirmRegistration(payment.$id)}
                                disabled={processingPayment === payment.$id}
                                isLoading={processingPayment === payment.$id}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {processingPayment === payment.$id ? 'Confirming...' : 'Confirm & Activate'}
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
                  <UserPlus className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No registration payments found</h3>
                  <p className="text-neutral">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No registration fee payments have been submitted yet.'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Registration Fee Settings */}
          <Card className="bg-accent/5 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center text-accent">
                <DollarSign className="h-5 w-5 mr-2" />
                Registration Fee Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">₦{stats.registrationFee}</div>
                  <p className="text-sm text-neutral">Current Fee Amount</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.confirmedRegistrations > 0 ? ((stats.confirmedRegistrations / stats.totalRegistrations) * 100).toFixed(1) : 0}%
                  </div>
                  <p className="text-sm text-neutral">Confirmation Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ₦{stats.totalAmount > 0 ? (stats.totalAmount / stats.confirmedRegistrations).toFixed(0) : stats.registrationFee}
                  </div>
                  <p className="text-sm text-neutral">Average per Member</p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-neutral">
                  Registration fee is configured via environment variables. 
                  Current fee: <span className="font-medium">₦{stats.registrationFee}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}