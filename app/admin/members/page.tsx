'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Users, Search, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle, PiggyBank, Download, Eye, CreditCard, User, DollarSign, FileText, TrendingUp, Clock, X } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { memberService, registrationService, savingsService, loansService } from '@/lib/services';
import { formatDate } from '@/lib/utils';

export default function AdminMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const [registrationPayments, setRegistrationPayments] = useState<any[]>([]);
  const [memberSavings, setMemberSavings] = useState<{[key: string]: any}>({});
  const [memberLoans, setMemberLoans] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showMemberDetails, setShowMemberDetails] = useState(false);

  useEffect(() => {
    loadMembers();
    
    // Auto-refresh every 30 seconds to catch status updates
    const interval = setInterval(() => {
      loadMembers(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = members;

    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.membershipNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => 
        member.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredMembers(filtered);
  }, [members, searchTerm, statusFilter]);

  const loadMembers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const [memberData, registrationData, allSavings, allLoanRequests] = await Promise.all([
        memberService.getAllMembers(),
        registrationService.getRegistrationPayments(),
        savingsService.getAllSavingsPayments(),
        loansService.getAllLoanRequests()
      ]);
      
      // Calculate savings totals for each member
      const savingsMap: {[key: string]: any} = {};
      const loansMap: {[key: string]: any} = {};
      
      memberData.forEach(member => {
        // Savings data
        const memberSavingsData = allSavings.filter(saving => saving.memberId === member.$id);
        const confirmedSavings = memberSavingsData.filter(s => s.status === 'Confirmed');
        const totalSavings = confirmedSavings.reduce((sum, saving) => sum + (saving.amount || 0), 0);
        const pendingSavings = memberSavingsData.filter(s => s.status === 'Pending').length;
        
        savingsMap[member.$id] = {
          totalAmount: totalSavings,
          totalDeposits: confirmedSavings.length,
          pendingDeposits: pendingSavings,
          allSavings: memberSavingsData
        };
        
        // Loans data
        const memberLoanRequests = allLoanRequests.filter(loan => loan.memberId === member.$id);
        const approvedLoans = memberLoanRequests.filter(loan => loan.status === 'Approved');
        const totalBorrowed = approvedLoans.reduce((sum, loan) => sum + (loan.approvedAmount || 0), 0);
        const totalOutstanding = approvedLoans.reduce((sum, loan) => sum + (loan.currentBalance || 0), 0);
        const pendingRequests = memberLoanRequests.filter(loan => loan.status === 'Pending Review').length;
        
        loansMap[member.$id] = {
          totalBorrowed,
          totalOutstanding,
          activeLoans: approvedLoans.length,
          pendingRequests,
          allRequests: memberLoanRequests
        };
      });
      
      setMembers(memberData);
      setRegistrationPayments(registrationData);
      setMemberSavings(savingsMap);
      setMemberLoans(loansMap);
      setFilteredMembers(memberData);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    loadMembers(true);
  };

  const openMemberDetails = (member: any) => {
    setSelectedMember(member);
    setShowMemberDetails(true);
  };

  const closeMemberDetails = () => {
    setSelectedMember(null);
    setShowMemberDetails(false);
  };

  // Download member savings report
  const downloadMemberSavings = (member: any) => {
    const memberSavingsData = memberSavings[member.$id]?.allSavings || [];
    
    const csvContent = [
      ['Date', 'Amount', 'Status', 'Description', 'Confirmed Date'].join(','),
      ...memberSavingsData.map((saving: any) => [
        formatDate(saving.$createdAt),
        `₦${saving.amount}`,
        saving.status,
        saving.description || 'Savings deposit',
        saving.confirmedAt ? formatDate(saving.confirmedAt) : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${member.fullName}_savings_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Download member loans report
  const downloadMemberLoans = (member: any) => {
    const memberLoanData = memberLoans[member.$id]?.allRequests || [];
    
    const csvContent = [
      ['Date', 'Requested Amount', 'Approved Amount', 'Outstanding Balance', 'Status', 'Purpose'].join(','),
      ...memberLoanData.map((loan: any) => [
        formatDate(loan.$createdAt),
        `₦${loan.requestedAmount}`,
        `₦${loan.approvedAmount || 0}`,
        `₦${loan.currentBalance || 0}`,
        loan.status,
        loan.purpose || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${member.fullName}_loans_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Get registration fee status for a member
  const getRegistrationStatus = (memberId: string) => {
    const registration = registrationPayments.find(p => p.memberId === memberId);
    if (!registration) return { 
      status: 'Not Paid', 
      color: 'bg-red-100 text-red-800 border-red-200',
      timestamp: null
    };
    
    switch (registration.status) {
      case 'Confirmed':
        return { 
          status: 'Paid', 
          color: 'bg-green-100 text-green-800 border-green-200',
          timestamp: registration.confirmedAt || registration.$updatedAt
        };
      case 'Pending':
        return { 
          status: 'Pending', 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          timestamp: registration.$createdAt
        };
      default:
        return { 
          status: 'Not Paid', 
          color: 'bg-red-100 text-red-800 border-red-200',
          timestamp: null
        };
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
              <h1 className="text-3xl font-serif font-bold">Member Management</h1>
              <p className="text-neutral">Manage and view all Chamber members</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-neutral">
                Total: {members.length} members
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                isLoading={refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
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
                    placeholder="Search by name, email, or member number..."
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
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    onClick={handleRefresh}
                    disabled={refreshing}
                    isLoading={refreshing}
                    className="w-full"
                  >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members List */}
          <div className="grid grid-cols-1 gap-6">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <Card key={member.$id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-accent">
                            {member.fullName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <h3 className="text-lg font-semibold">{member.fullName}</h3>
                            <p className="text-sm text-neutral">{member.membershipNumber}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2 text-neutral" />
                              <span>{member.email}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-neutral" />
                              <span>{member.phoneNumber || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-neutral" />
                              <span>{member.address || 'Not provided'}</span>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-neutral">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Joined {formatDate(member.$createdAt)}</span>
                          </div>
                          
                          {/* Financial Summary */}
                          <div className="mt-3 space-y-2">
                            {/* Savings Summary */}
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <PiggyBank className="h-4 w-4 text-green-600 mr-2" />
                                  <span className="text-sm font-medium text-green-800">Total Savings</span>
                                </div>
                                <span className="text-lg font-bold text-green-700">
                                  ₦{memberSavings[member.$id]?.totalAmount?.toLocaleString() || '0'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-1 text-xs text-green-700">
                                <span>{memberSavings[member.$id]?.totalDeposits || 0} confirmed deposits</span>
                                {memberSavings[member.$id]?.pendingDeposits > 0 && (
                                  <span className="text-yellow-600">
                                    {memberSavings[member.$id]?.pendingDeposits} pending
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Loans Summary */}
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <CreditCard className="h-4 w-4 text-blue-600 mr-2" />
                                  <span className="text-sm font-medium text-blue-800">Outstanding Loans</span>
                                </div>
                                <span className="text-lg font-bold text-red-600">
                                  ₦{memberLoans[member.$id]?.totalOutstanding?.toLocaleString() || '0'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-1 text-xs text-blue-700">
                                <span>{memberLoans[member.$id]?.activeLoans || 0} active loans</span>
                                {memberLoans[member.$id]?.pendingRequests > 0 && (
                                  <span className="text-yellow-600">
                                    {memberLoans[member.$id]?.pendingRequests} pending requests
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-3">
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            member.status === 'Active' 
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : member.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {member.status}
                          </span>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRegistrationStatus(member.$id).color}`}>
                              Registration: {getRegistrationStatus(member.$id).status}
                            </span>
                            {getRegistrationStatus(member.$id).timestamp && (
                              <p className="text-xs text-neutral mt-1">
                                {getRegistrationStatus(member.$id).status === 'Paid' ? 'Confirmed' : 'Submitted'}: {formatDate(getRegistrationStatus(member.$id).timestamp)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openMemberDetails(member)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            {member.status === 'Pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="accent"
                                  onClick={() => {/* Approve member functionality */}}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {/* Reject member functionality */}}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                          
                          {/* Financial Reports */}
                          <div className="flex flex-col space-y-1">
                            {memberSavings[member.$id]?.totalDeposits > 0 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => downloadMemberSavings(member)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 text-xs"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Savings Report
                              </Button>
                            )}
                            {memberLoans[member.$id]?.allRequests?.length > 0 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => downloadMemberLoans(member)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Loans Report
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No members found</h3>
                  <p className="text-neutral">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No members have been registered yet.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Member Details Modal */}
          {showMemberDetails && selectedMember && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-6xl bg-background border border-border shadow-xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="sticky top-0 bg-background border-b z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-accent">
                          {selectedMember.fullName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{selectedMember.fullName}</CardTitle>
                        <CardDescription>{selectedMember.membershipNumber}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={closeMemberDetails}
                      className="rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <User className="h-5 w-5 mr-2 text-accent" />
                          Personal Information
                        </h3>
                        <div className="space-y-3 bg-neutral-50 p-4 rounded-lg">
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-3 text-neutral" />
                              <div>
                                <p className="text-sm text-neutral">Email</p>
                                <p className="font-medium">{selectedMember.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-3 text-neutral" />
                              <div>
                                <p className="text-sm text-neutral">Phone Number</p>
                                <p className="font-medium">{selectedMember.phoneNumber || 'Not provided'}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-3 text-neutral" />
                              <div>
                                <p className="text-sm text-neutral">Address</p>
                                <p className="font-medium">{selectedMember.address || 'Not provided'}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-3 text-neutral" />
                              <div>
                                <p className="text-sm text-neutral">Join Date</p>
                                <p className="font-medium">{formatDate(selectedMember.$createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Membership Status */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2 text-accent" />
                          Membership Status
                        </h3>
                        <div className="space-y-3 bg-neutral-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral">Current Status</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              selectedMember.status === 'Active' 
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : selectedMember.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {selectedMember.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral">Registration Fee</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRegistrationStatus(selectedMember.$id).color}`}>
                              {getRegistrationStatus(selectedMember.$id).status}
                            </span>
                          </div>
                          {getRegistrationStatus(selectedMember.$id).timestamp && (
                            <div className="text-xs text-neutral">
                              <span className="font-medium">
                                {getRegistrationStatus(selectedMember.$id).status === 'Paid' ? 'Confirmed' : 'Submitted'}: 
                              </span>
                              <span className="ml-1">{formatDate(getRegistrationStatus(selectedMember.$id).timestamp)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div className="space-y-6">
                      {/* Savings Details */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <PiggyBank className="h-5 w-5 mr-2 text-green-600" />
                          Savings Summary
                        </h3>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-green-700">Total Savings</p>
                              <p className="text-2xl font-bold text-green-800">
                                ₦{memberSavings[selectedMember.$id]?.totalAmount?.toLocaleString() || '0'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-green-700">Total Deposits</p>
                              <p className="text-2xl font-bold text-green-800">
                                {memberSavings[selectedMember.$id]?.totalDeposits || 0}
                              </p>
                            </div>
                          </div>
                          {memberSavings[selectedMember.$id]?.pendingDeposits > 0 && (
                            <div className="mt-3 p-2 bg-yellow-100 border border-yellow-200 rounded text-sm">
                              <span className="text-yellow-800">
                                {memberSavings[selectedMember.$id]?.pendingDeposits} pending deposit{memberSavings[selectedMember.$id]?.pendingDeposits !== 1 ? 's' : ''} awaiting confirmation
                              </span>
                            </div>
                          )}
                          {memberSavings[selectedMember.$id]?.totalDeposits > 0 && (
                            <div className="mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadMemberSavings(selectedMember)}
                                className="w-full text-green-600 border-green-300 hover:bg-green-100"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Savings Report
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Loans Details */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                          Loans Summary
                        </h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-blue-700">Total Borrowed</p>
                              <p className="text-2xl font-bold text-blue-800">
                                ₦{memberLoans[selectedMember.$id]?.totalBorrowed?.toLocaleString() || '0'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-blue-700">Outstanding</p>
                              <p className="text-2xl font-bold text-red-600">
                                ₦{memberLoans[selectedMember.$id]?.totalOutstanding?.toLocaleString() || '0'}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-sm text-blue-700">Active Loans</p>
                              <p className="text-lg font-semibold text-blue-800">
                                {memberLoans[selectedMember.$id]?.activeLoans || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-blue-700">Pending Requests</p>
                              <p className="text-lg font-semibold text-yellow-600">
                                {memberLoans[selectedMember.$id]?.pendingRequests || 0}
                              </p>
                            </div>
                          </div>
                          {memberLoans[selectedMember.$id]?.allRequests?.length > 0 && (
                            <div className="mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadMemberLoans(selectedMember)}
                                className="w-full text-blue-600 border-blue-300 hover:bg-blue-100"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Loans Report
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-accent" />
                      Recent Activity
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Recent Savings */}
                      <div>
                        <h4 className="font-medium mb-3 text-green-700">Recent Savings Deposits</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {memberSavings[selectedMember.$id]?.allSavings?.slice(0, 5).map((saving: any) => (
                            <div key={saving.$id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                              <div>
                                <p className="font-medium text-green-800">₦{saving.amount}</p>
                                <p className="text-xs text-green-600">{formatDate(saving.$createdAt)}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                saving.status === 'Confirmed' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {saving.status}
                              </span>
                            </div>
                          )) || <p className="text-neutral text-sm">No savings deposits yet</p>}
                        </div>
                      </div>

                      {/* Recent Loans */}
                      <div>
                        <h4 className="font-medium mb-3 text-blue-700">Recent Loan Requests</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {memberLoans[selectedMember.$id]?.allRequests?.slice(0, 5).map((loan: any) => (
                            <div key={loan.$id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                              <div>
                                <p className="font-medium text-blue-800">₦{loan.requestedAmount?.toLocaleString()}</p>
                                <p className="text-xs text-blue-600">{formatDate(loan.$createdAt)}</p>
                                <p className="text-xs text-neutral truncate max-w-32">{loan.purpose}</p>
                              </div>
                              <div className="text-right">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  loan.status === 'Approved' 
                                    ? 'bg-green-100 text-green-800'
                                    : loan.status === 'Pending Review'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : loan.status === 'Rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {loan.status}
                                </span>
                                {loan.status === 'Approved' && (
                                  <p className="text-xs text-red-600 mt-1">
                                    Bal: ₦{loan.currentBalance?.toLocaleString() || '0'}
                                  </p>
                                )}
                              </div>
                            </div>
                          )) || <p className="text-neutral text-sm">No loan requests yet</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedMember.status === 'Pending' && (
                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium mb-3 text-yellow-800">Member Actions</h4>
                      <div className="flex space-x-3">
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => {/* Approve member functionality */}}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Member
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* Reject member functionality */}}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Member
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}