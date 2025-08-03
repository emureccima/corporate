'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DollarSign } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AdminPaymentsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout userRole="admin">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-serif font-bold">Payment Management</h1>
              <p className="text-neutral">Payment services have been removed</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Payment System Removed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <DollarSign className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Payment Services Disabled</h3>
                <p className="text-neutral">
                  General payment services have been removed from this application.
                  Only savings deposits and loan repayments are now available through their respective sections.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}