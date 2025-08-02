'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { memberService } from '@/lib/services';
import { formatDate } from '@/lib/utils';

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
    emergencyPhone: ''
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
          emergencyPhone: profile.emergencyPhone || ''
        });
      }
    } catch (error) {
      console.error('Error loading member profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user?.memberId) {
      alert('User not found. Please try again.');
      return;
    }

    // Confirm before saving
    const confirmed = window.confirm('Are you sure you want to save these changes?');
    if (!confirmed) {
      return;
    }

    setSaving(true);
    try {
      // Validate required fields
      if (!formData.fullName.trim()) {
        alert('Full name is required.');
        return;
      }

      if (!formData.email.trim()) {
        alert('Email is required.');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address.');
        return;
      }

      // Phone number validation (optional but if provided, should be valid)
      if (formData.phoneNumber.trim()) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
          alert('Please enter a valid phone number.');
          return;
        }
      }

      // Emergency phone validation (optional but if provided, should be valid)
      if (formData.emergencyPhone.trim()) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(formData.emergencyPhone.replace(/\s/g, ''))) {
          alert('Please enter a valid emergency contact phone number.');
          return;
        }
      }

      // Update the member profile
      const updatedMember = await memberService.updateMember(user.memberId, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        emergencyContact: formData.emergencyContact.trim(),
        emergencyPhone: formData.emergencyPhone.trim()
      });

      if (updatedMember) {
        setEditing(false);
        alert('Profile updated successfully!');
        
        // Reload profile data
        await loadMemberProfile();
      } else {
        alert('Failed to update profile. Please try again.');
      }
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      // Provide more specific error messages
      if (error.code === 401) {
        alert('Authentication failed. Please log in again.');
      } else if (error.code === 403) {
        alert('You do not have permission to update this profile.');
      } else if (error.code === 409) {
        alert('This email is already in use by another member.');
      } else {
        alert('Failed to update profile. Please check your connection and try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Check if there are unsaved changes
    const hasChanges = 
      formData.fullName !== (memberData?.fullName || '') ||
      formData.email !== (memberData?.email || '') ||
      formData.phoneNumber !== (memberData?.phoneNumber || '') ||
      formData.address !== (memberData?.address || '') ||
      formData.emergencyContact !== (memberData?.emergencyContact || '') ||
      formData.emergencyPhone !== (memberData?.emergencyPhone || '');

    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
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
        emergencyPhone: memberData.emergencyPhone || ''
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
            {/* {!editing && (
              <Button 
                variant="outline" 
                onClick={() => setEditing(true)}
                className="flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )} */}
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
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}