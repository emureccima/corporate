'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, Search, Globe, Phone, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { memberService } from '@/lib/services';
import { formatDate } from '@/lib/utils';

import { toast } from 'sonner';

export default function AdminDirectoryPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, statusFilter]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const allMembers = await memberService.getAllMembers();
      // Show members who have any business information or are included in directory
      const businessMembers = allMembers.filter(member => 
        member.businessName || 
        member.businessDescription || 
        member.businessType || 
        member.businessPhone || 
        member.businessWebsite || 
        member.businessAddress || 
        member.includeInDirectory
      );
      setMembers(businessMembers);
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Failed to load business directory');
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = members;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.fullName?.toLowerCase().includes(term) ||
        member.membershipNumber?.toLowerCase().includes(term) ||
        member.businessName?.toLowerCase().includes(term) ||
        member.businessType?.toLowerCase().includes(term) ||
        member.businessDescription?.toLowerCase().includes(term) ||
        member.businessAddress?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => {
        switch (statusFilter) {
          case 'published':
            return member.directoryStatus === 'Published' && member.includeInDirectory;
          case 'draft':
            return member.directoryStatus === 'Draft' || (!member.directoryStatus && member.businessName);
          case 'hidden':
            return !member.includeInDirectory;
          case 'incomplete':
            return !member.businessName || !member.businessDescription || !member.businessType;
          default:
            return true;
        }
      });
    }

    setFilteredMembers(filtered);
  };

  const updateDirectoryStatus = async (memberId: string, status: 'Published' | 'Draft') => {
    try {
      // This would need to be implemented in the memberService
      await memberService.updateMember(memberId, {
        directoryStatus: status,
        directoryUpdatedAt: new Date().toISOString()
      });
      
      // Update local state
      setMembers(prev => prev.map(member => 
        member.$id === memberId 
          ? { ...member, directoryStatus: status, directoryUpdatedAt: new Date().toISOString() }
          : member
      ));
      
      toast.success(`Business directory status updated to ${status}`);
    } catch (error) {
      console.error('Error updating directory status:', error);
      toast.error('Failed to update directory status');
    }
  };

  const toggleDirectoryInclusion = async (memberId: string, include: boolean) => {
    try {
      await memberService.updateMember(memberId, {
        includeInDirectory: include,
        directoryUpdatedAt: new Date().toISOString()
      });
      
      setMembers(prev => prev.map(member => 
        member.$id === memberId 
          ? { ...member, includeInDirectory: include, directoryUpdatedAt: new Date().toISOString() }
          : member
      ));
      
      toast.success(`Member ${include ? 'included in' : 'removed from'} directory`);
    } catch (error) {
      console.error('Error updating directory inclusion:', error);
      toast.error('Failed to update directory inclusion');
    }
  };

  const isProfileComplete = (member: any) => {
    return !!(
      member.businessName && 
      member.businessDescription && 
      member.businessType && 
      member.businessPhone &&
      member.businessAddress
    );
  };

  const getMissingFields = (member: any) => {
    const missing = [];
    if (!member.businessName) missing.push('Business Name');
    if (!member.businessDescription) missing.push('Description');
    if (!member.businessType) missing.push('Type');
    if (!member.businessPhone) missing.push('Phone');
    if (!member.businessAddress) missing.push('Address');
    return missing;
  };

  const getDirectoryStatusBadge = (member: any) => {
    if (!member.includeInDirectory) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircle className="h-3 w-3 mr-1" />
          Hidden
        </span>
      );
    }

    if (member.directoryStatus === 'Published') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Published
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3 mr-1" />
        Draft
      </span>
    );
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
              <h1 className="text-3xl font-serif font-bold">Business Directory</h1>
              <p className="text-neutral">Manage member business listings and directory</p>
            </div>
            <Button onClick={loadMembers} variant="outline">
              Refresh Directory
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                    <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Published</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {members.filter(m => m.directoryStatus === 'Published' && m.includeInDirectory).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Draft</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {members.filter(m => m.directoryStatus === 'Draft' || !m.directoryStatus).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-gray-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Hidden</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {members.filter(m => !m.includeInDirectory).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Incomplete</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {members.filter(m => !isProfileComplete(m)).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by business name, owner, or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="hidden">Hidden</option>
                  <option value="incomplete">Incomplete Profiles</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Directory Listings */}
          <div className="grid grid-cols-1 gap-6">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <Card key={member.$id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {member.businessName || `${member.fullName}'s Business`}
                              </h3>
                              {!isProfileComplete(member) && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Incomplete
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              Owner: {member.fullName} • {member.membershipNumber}
                            </p>
                            {member.businessType ? (
                              <p className="text-sm text-blue-600 font-medium mt-1">
                                {member.businessType}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-400 font-medium mt-1 italic">
                                Business type not specified
                              </p>
                            )}
                            {!isProfileComplete(member) && (
                              <p className="text-xs text-orange-600 mt-1">
                                Missing: {getMissingFields(member).join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="ml-4">
                            {getDirectoryStatusBadge(member)}
                          </div>
                        </div>

                        {member.businessDescription ? (
                          <p className="text-gray-700 mb-4">
                            {member.businessDescription}
                          </p>
                        ) : (
                          <p className="text-gray-400 mb-4 italic">
                            Business description not provided yet
                          </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {member.businessPhone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{member.businessPhone}</span>
                            </div>
                          )}
                          {member.businessWebsite && (
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-2 text-gray-400" />
                              <a
                                href={member.businessWebsite.startsWith('http') ? member.businessWebsite : `https://${member.businessWebsite}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline truncate"
                              >
                                {member.businessWebsite}
                              </a>
                            </div>
                          )}
                        </div>

                        {member.businessAddress && (
                          <div className="mt-3">
                            <div className="flex items-start">
                              <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                              <span className="text-sm text-gray-700">{member.businessAddress}</span>
                            </div>
                          </div>
                        )}

                        {member.directoryUpdatedAt && (
                          <p className="text-xs text-gray-500 mt-4">
                            Last updated: {formatDate(member.directoryUpdatedAt)}
                          </p>
                        )}
                      </div>

                      {/* <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>

                        <div className="flex flex-col space-y-2">
                          {member.includeInDirectory ? (
                            <>
                              {member.directoryStatus !== 'Published' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateDirectoryStatus(member.$id!, 'Published')}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Publish
                                </Button>
                              )}
                              {member.directoryStatus === 'Published' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateDirectoryStatus(member.$id!, 'Draft')}
                                >
                                  <Clock className="h-4 w-4 mr-1" />
                                  Move to Draft
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleDirectoryInclusion(member.$id!, false)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Hide
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleDirectoryInclusion(member.$id!, true)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Include
                            </Button>
                          )}
                        </div>
                      </div> */}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No business listings found</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No members have added business information yet.'
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