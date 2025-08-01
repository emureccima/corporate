'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, Calendar, DollarSign, FileText, Settings, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
        <p className="text-neutral">Manage your cooperative operations and member services</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-neutral">+12 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <UserCheck className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-neutral">Require your attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.5M</div>
            <p className="text-xs text-neutral">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <FileText className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-neutral">$1.8M outstanding</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-accent" />
              Member Management
            </CardTitle>
            <CardDescription>
              Approve new members, manage existing accounts, and assign membership numbers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              View All Members
            </Button>
            <Button className="w-full" variant="outline">
              Pending Registrations
            </Button>
            <Button className="w-full" variant="outline">
              Member Reports
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-accent" />
              Financial Management
            </CardTitle>
            <CardDescription>
              Manage savings, loans, payments, and generate financial reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              Payment Confirmations
            </Button>
            <Button className="w-full" variant="outline">
              Loan Applications
            </Button>
            <Button className="w-full" variant="outline">
              Financial Reports
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-accent" />
              Event Management
            </CardTitle>
            <CardDescription>
              Create and manage community events, upload photos to gallery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              Create New Event
            </Button>
            <Button className="w-full" variant="outline">
              Manage Events
            </Button>
            <Button className="w-full" variant="outline">
              Upload Photos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-accent" />
              Reports & Analytics
            </CardTitle>
            <CardDescription>
              Generate detailed reports on member activity and financial performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              Member Activity
            </Button>
            <Button className="w-full" variant="outline">
              Financial Summary
            </Button>
            <Button className="w-full" variant="outline">
              Export Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-accent" />
              System Settings
            </CardTitle>
            <CardDescription>
              Configure system settings, bank details, and notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              Bank Account Settings
            </Button>
            <Button className="w-full" variant="outline">
              Notification Settings
            </Button>
            <Button className="w-full" variant="outline">
              System Configuration
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="accent">
              Approve All Pending
            </Button>
            <Button className="w-full" variant="accent">
              Send Notifications
            </Button>
            <Button className="w-full" variant="accent">
              Generate Monthly Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions and member activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div>
                <p className="font-medium">New member registration</p>
                <p className="text-sm text-neutral">John Smith registered and paid membership fee</p>
              </div>
              <span className="text-xs text-neutral">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div>
                <p className="font-medium">Payment confirmation needed</p>
                <p className="text-sm text-neutral">Sarah Johnson made a savings deposit of $500</p>
              </div>
              <span className="text-xs text-neutral">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div>
                <p className="font-medium">Loan application submitted</p>
                <p className="text-sm text-neutral">Mike Davis applied for a $5,000 loan</p>
              </div>
              <span className="text-xs text-neutral">1 day ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </ProtectedRoute>
  );
}