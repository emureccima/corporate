'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Users, Search, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { memberService, registrationService } from '@/lib/services';
import { formatDate } from '@/lib/utils';

export default function AdminMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const [registrationPayments, setRegistrationPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
      
      const [memberData, registrationData] = await Promise.all([
        memberService.getAllMembers(),
        registrationService.getRegistrationPayments()
      ]);
      
      setMembers(memberData);
      setRegistrationPayments(registrationData);
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
              <p className="text-neutral">Manage and view all cooperative members</p>
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
                        
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {/* View details functionality */}}
                          >
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}