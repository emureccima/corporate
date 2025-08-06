'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Building2, Globe } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { memberService } from '@/lib/services';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function MemberProfilePage() {
  const { user } = useAuth();
  const [memberData, setMemberData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    // Business Directory Fields
    businessName: '',
    businessDescription: '',
    businessType: '',
    businessPhone: '',
    businessWebsite: '',
    businessAddress: '',
    includeInDirectory: false
  });

  useEffect(() => {
    if (user?.memberId) {
      loadMemberProfile();
    }
  }, [user]);

  const loadMemberProfile = async () => {
    if (!user?.memberId) return;
    
    try {
      setLoading(true);
      const profile = await memberService.getMemberById(user.memberId);
      if (profile) {
        setMemberData(profile);
        setFormData({
          fullName: profile.fullName || '',
          email: profile.email || '',
          phoneNumber: profile.phoneNumber || '',
          address: profile.address || '',
          emergencyContact: profile.emergencyContact || '',
          emergencyPhone: profile.emergencyPhone || '',
          // Business Directory Fields
          businessName: profile.businessName || '',
          businessDescription: profile.businessDescription || '',
          businessType: profile.businessType || '',
          businessPhone: profile.businessPhone || '',
          businessWebsite: profile.businessWebsite || '',
          businessAddress: profile.businessAddress || '',
          includeInDirectory: profile.includeInDirectory || false
        });
      }
    } catch (error) {
      console.error('Error loading member profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user?.memberId) {
      toast.error('User not found. Please try again.');
      return;
    }

    // Use toast confirmation instead of window.confirm
    const confirmSave = () => new Promise((resolve) => {
      toast('💾 Save Changes?', {
        description: 'Are you sure you want to save these changes to your profile?',
        action: {
          label: 'Save',
          onClick: () => resolve(true)
        },
        cancel: {
          label: 'Cancel',
          onClick: () => resolve(false)
        },
        duration: 10000
      });
    });
    
    const confirmed = await confirmSave();
    if (!confirmed) {
      return;
    }

    setSaving(true);
    try {
      // Validate required fields
      if (!formData.fullName.trim()) {
        toast.error('Full name is required.');
        return;
      }

      if (!formData.email.trim()) {
        toast.error('Email is required.');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address.');
        return;
      }

      // Phone number validation (optional but if provided, should be valid)
      // if (formData.phoneNumber.trim()) {
      //   const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      //   if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
      //     toast.error('Please enter a valid phone number.');
      //     return;
      //   }
      // }

      // Emergency phone validation (optional but if provided, should be valid)
      // if (formData.emergencyPhone.trim()) {
      //   const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      //   if (!phoneRegex.test(formData.emergencyPhone.replace(/\s/g, ''))) {
      //     toast.error('Please enter a valid emergency contact phone number.');
      //     return;
      //   }
      // }

      // Update the member profile
      const updatedMember = await memberService.updateMember(user.memberId, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        emergencyContact: formData.emergencyContact.trim(),
        emergencyPhone: formData.emergencyPhone.trim(),
        // Business Directory Fields
        businessName: formData.businessName.trim(),
        businessDescription: formData.businessDescription.trim(),
        businessType: formData.businessType.trim(),
        businessPhone: formData.businessPhone.trim(),
        businessWebsite: formData.businessWebsite.trim(),
        businessAddress: formData.businessAddress.trim(),
        includeInDirectory: formData.includeInDirectory,
        directoryStatus: formData.businessName.trim() ? 'Draft' : undefined,
        directoryUpdatedAt: formData.businessName.trim() ? new Date().toISOString() : undefined
      });

      if (updatedMember) {
        setEditing(false);
        toast.success('Profile updated successfully!');
        
        // Reload profile data
        await loadMemberProfile();
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      // Provide more specific error messages
      if (error.code === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else if (error.code === 403) {
        toast.error('You do not have permission to update this profile.');
      } else if (error.code === 409) {
        toast.error('This email is already in use by another member.');
      } else {
        toast.error('Failed to update profile. Please check your connection and try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    // Check if there are unsaved changes
    const hasChanges = 
      formData.fullName !== (memberData?.fullName || '') ||
      formData.email !== (memberData?.email || '') ||
      formData.phoneNumber !== (memberData?.phoneNumber || '') ||
      formData.address !== (memberData?.address || '') ||
      formData.emergencyContact !== (memberData?.emergencyContact || '') ||
      formData.emergencyPhone !== (memberData?.emergencyPhone || '');

    if (hasChanges) {
      const confirmCancel = () => new Promise((resolve) => {
        toast.warning('⚠️ Unsaved Changes', {
          description: 'You have unsaved changes. Are you sure you want to cancel?',
          action: {
            label: 'Yes, Cancel',
            onClick: () => resolve(true)
          },
          cancel: {
            label: 'Keep Editing',
            onClick: () => resolve(false)
          },
          duration: 10000
        });
      });
      
      const confirmed = await confirmCancel();
      if (!confirmed) {
        return;
      }
    }

    setEditing(false);
    // Reset form data to original values
    if (memberData) {
      setFormData({
        fullName: memberData.fullName || '',
        email: memberData.email || '',
        phoneNumber: memberData.phoneNumber || '',
        address: memberData.address || '',
        emergencyContact: memberData.emergencyContact || '',
        emergencyPhone: memberData.emergencyPhone || '',
        // Business Directory Fields
        businessName: memberData.businessName || '',
        businessDescription: memberData.businessDescription || '',
        businessType: memberData.businessType || '',
        businessPhone: memberData.businessPhone || '',
        businessWebsite: memberData.businessWebsite || '',
        businessAddress: memberData.businessAddress || '',
        includeInDirectory: memberData.includeInDirectory || false
      });
    }
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

  if (!memberData) {
    return (
      <ProtectedRoute requiredRole="member">
        <DashboardLayout userRole="member">
          <div className="text-center py-12">
            <User className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Profile not found</h3>
            <p className="text-neutral">Unable to load your profile information.</p>
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-serif font-bold">My Profile</h1>
              <p className="text-neutral">Manage your personal information and account settings</p>
            </div>
            {!editing && (
              <Button 
                variant="outline" 
                onClick={() => setEditing(true)}
                className="flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-semibold text-accent">
                      {memberData.fullName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <CardTitle>{memberData.fullName}</CardTitle>
                  <CardDescription>{memberData.membershipNumber}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      memberData.status === 'Active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {memberData.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral">Member Since</span>
                    <span className="text-sm font-medium">{formatDate(memberData.$createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral">Role</span>
                    <span className="text-sm font-medium capitalize">{user?.role}</span>
                  </div>
                  {memberData.updatedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral">Last Updated</span>
                      <span className="text-sm font-medium">{formatDate(memberData.updatedAt)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Your account details and contact information</CardDescription>
                    </div>
                    {editing && (
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          variant="accent" 
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-1" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Full Name</label>
                      {editing ? (
                        <Input
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-neutral-50 rounded-md">
                          <User className="h-4 w-4 mr-2 text-neutral" />
                          <span>{memberData.fullName || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Email Address</label>
                      {editing ? (
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter your email"
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-neutral-50 rounded-md">
                          <Mail className="h-4 w-4 mr-2 text-neutral" />
                          <span>{memberData.email || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Phone Number</label>
                      {editing ? (
                        <Input
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-neutral-50 rounded-md">
                          <Phone className="h-4 w-4 mr-2 text-neutral" />
                          <span>{memberData.phoneNumber || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Membership Number</label>
                      <div className="flex items-center p-3 bg-neutral-100 rounded-md">
                        <Calendar className="h-4 w-4 mr-2 text-neutral" />
                        <span className="font-medium">{memberData.membershipNumber}</span>
                      </div>
                      <p className="text-xs text-neutral mt-1">This cannot be changed</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Address</label>
                    {editing ? (
                      <textarea
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter your address"
                        rows={3}
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-start p-3 bg-neutral-50 rounded-md">
                        <MapPin className="h-4 w-4 mr-2 text-neutral mt-0.5" />
                        <span>{memberData.address || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Emergency Contact</label>
                      {editing ? (
                        <Input
                          value={formData.emergencyContact}
                          onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                          placeholder="Emergency contact name"
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-neutral-50 rounded-md">
                          <User className="h-4 w-4 mr-2 text-neutral" />
                          <span>{memberData.emergencyContact || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Emergency Phone</label>
                      {editing ? (
                        <Input
                          type="tel"
                          value={formData.emergencyPhone}
                          onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                          placeholder="Emergency contact phone"
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-neutral-50 rounded-md">
                          <Phone className="h-4 w-4 mr-2 text-neutral" />
                          <span>{memberData.emergencyPhone || 'Not provided'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Directory Section */}
              <Card className="mt-8">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center">
                        <Building2 className="h-5 w-5 mr-2" />
                        Business Directory
                      </CardTitle>
                      <CardDescription>Add your business to the Chamber directory</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Business Name</label>
                      {editing ? (
                        <Input
                          value={formData.businessName}
                          onChange={(e) => handleInputChange('businessName', e.target.value)}
                          placeholder="Enter your business name"
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-neutral-50 rounded-md">
                          <Building2 className="h-4 w-4 mr-2 text-neutral" />
                          <span>{memberData.businessName || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Business Type</label>
                      {editing ? (
                        <select
                          value={formData.businessType}
                          onChange={(e) => handleInputChange('businessType', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                        >
                          <option value="">Select business type</option>
                          <option value="Agriculture">Agriculture</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Services">Services</option>
                          <option value="Retail">Retail</option>
                          <option value="Technology">Technology</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Education">Education</option>
                          <option value="Finance">Finance</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <div className="flex items-center p-3 bg-neutral-50 rounded-md">
                          <Building2 className="h-4 w-4 mr-2 text-neutral" />
                          <span>{memberData.businessType || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Business Phone</label>
                      {editing ? (
                        <Input
                          type="tel"
                          value={formData.businessPhone}
                          onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                          placeholder="Business phone number"
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-neutral-50 rounded-md">
                          <Phone className="h-4 w-4 mr-2 text-neutral" />
                          <span>{memberData.businessPhone || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Business Website</label>
                      {editing ? (
                        <Input
                          type="url"
                          value={formData.businessWebsite}
                          onChange={(e) => handleInputChange('businessWebsite', e.target.value)}
                          placeholder="https://www.example.com"
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-neutral-50 rounded-md">
                          <Globe className="h-4 w-4 mr-2 text-neutral" />
                          {memberData.businessWebsite ? (
                            <a
                              href={memberData.businessWebsite.startsWith('http') ? memberData.businessWebsite : `https://${memberData.businessWebsite}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline truncate"
                            >
                              {memberData.businessWebsite}
                            </a>
                          ) : (
                            <span>Not provided</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Business Address</label>
                    {editing ? (
                      <textarea
                        value={formData.businessAddress}
                        onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                        placeholder="Enter your business address"
                        rows={3}
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-start p-3 bg-neutral-50 rounded-md">
                        <MapPin className="h-4 w-4 mr-2 text-neutral mt-0.5" />
                        <span>{memberData.businessAddress || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Business Description</label>
                    {editing ? (
                      <textarea
                        value={formData.businessDescription}
                        onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                        placeholder="Describe your business, products, or services"
                        rows={4}
                        maxLength={200}
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-start p-3 bg-neutral-50 rounded-md">
                        <Building2 className="h-4 w-4 mr-2 text-neutral mt-0.5" />
                        <span>{memberData.businessDescription || 'Not provided'}</span>
                      </div>
                    )}
                    {editing && (
                      <p className="text-xs text-neutral mt-1">
                        {formData.businessDescription.length}/200 characters
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Include in Public Directory</label>
                        <p className="text-xs text-neutral">Allow your business to be visible in the Chamber directory</p>
                      </div>
                      {editing ? (
                        <input
                          type="checkbox"
                          checked={formData.includeInDirectory}
                          onChange={(e) => handleInputChange('includeInDirectory', e.target.checked)}
                          className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                        />
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          memberData.includeInDirectory 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {memberData.includeInDirectory ? 'Included' : 'Not Included'}
                        </span>
                      )}
                    </div>

                    {memberData.directoryStatus && (
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-neutral">Directory Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          memberData.directoryStatus === 'Published' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {memberData.directoryStatus}
                        </span>
                      </div>
                    )}

                    {memberData.directoryUpdatedAt && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-neutral">Directory Last Updated</span>
                        <span className="text-sm font-medium">{formatDate(memberData.directoryUpdatedAt)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}