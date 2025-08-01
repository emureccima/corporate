'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { CreditCard, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { databases, appwriteConfig } from '@/lib/appwrite';
import { ID } from 'appwrite';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [selectedPaymentType, setSelectedPaymentType] = useState<'Registration' | 'Savings' | 'Loan_Repayment'>('Registration');
  const [amount, setAmount] = useState('');
  const [paymentMade, setPaymentMade] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bank details (to be provided by you)
  const bankDetails = {
    accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || 'Cooperative Society Account',
    accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || 'Account number to be provided',
    bankName: process.env.NEXT_PUBLIC_BANK_NAME || 'Bank name to be provided',
  };

  const registrationFee = parseFloat(process.env.NEXT_PUBLIC_REGISTRATION_FEE || '50');

  const paymentTypes = [
    {
      id: 'Registration' as const,
      title: 'Registration Fee',
      description: 'One-time membership registration fee',
      amount: registrationFee,
    },
    {
      id: 'Savings' as const,
      title: 'Savings Deposit',
      description: 'Add money to your savings account',
      amount: null,
    },
    {
      id: 'Loan_Repayment' as const,
      title: 'Loan Repayment',
      description: 'Make a payment towards your loan',
      amount: null,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create payment record in Appwrite database
      const paymentData = {
        memberId: user?.memberId,
        memberName: user?.name,
        paymentType: selectedPaymentType,
        amount: parseFloat(amount),
        bankAccount: bankDetails.accountNumber,
        accountName: bankDetails.accountName,
        transferType: 'Bank Transfer',
        paymentMade,
        confirmed: false,
        status: 'Pending',
        description: `${selectedPaymentType.replace('_', ' ')} payment of $${amount}`,
      };

      // Save to Appwrite
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.paymentsCollectionId,
        ID.unique(),
        paymentData
      );
      
      // Show success message
      alert('Payment submission successful! Please wait for admin confirmation.');
      
      // Reset form
      setAmount('');
      setPaymentMade(false);
      setShowBankDetails(false);
      
    } catch (error) {
      console.error('Payment submission failed:', error);
      alert('Payment submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <ProtectedRoute requiredRole="member">
      <DashboardLayout userRole="member">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-bold">Make a Payment</h1>
            <p className="text-neutral">Choose your payment type and complete the transaction</p>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="space-y-6">
          {/* Payment Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Payment Type</CardTitle>
              <CardDescription>Choose what you'd like to pay for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentTypes.map((type) => (
                <div
                  key={type.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPaymentType === type.id
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/50'
                  }`}
                  onClick={() => setSelectedPaymentType(type.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{type.title}</h3>
                      <p className="text-sm text-neutral">{type.description}</p>
                    </div>
                    {type.amount && (
                      <div className="text-lg font-semibold text-accent">
                        ${type.amount}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Amount"
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">Payment Method: Bank Transfer</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    All payments are processed through bank transfer to our cooperative account.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBankDetails(!showBankDetails)}
                  className="w-full"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {showBankDetails ? 'Hide' : 'Show'} Bank Details
                </Button>

                {showBankDetails && (
                  <Card className="bg-neutral-50">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Account Name:</span>
                          <div className="flex items-center">
                            <span className="text-sm">{bankDetails.accountName}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(bankDetails.accountName)}
                              className="ml-2 p-1 h-auto"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Account Number:</span>
                          <div className="flex items-center">
                            <span className="text-sm">{bankDetails.accountNumber}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(bankDetails.accountNumber)}
                              className="ml-2 p-1 h-auto"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Bank Name:</span>
                          <div className="flex items-center">
                            <span className="text-sm">{bankDetails.bankName}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(bankDetails.bankName)}
                              className="ml-2 p-1 h-auto"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="paymentMade"
                    checked={paymentMade}
                    onChange={(e) => setPaymentMade(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="paymentMade" className="text-sm">
                    I have completed the bank transfer
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!paymentMade || !amount || isSubmitting}
                  isLoading={isSubmitting}
                >
                  Submit Bank Transfer Confirmation
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Payment Status & Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-accent" />
                Payment Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Step 1: Get Bank Details</h4>
                    <p className="text-sm text-neutral">Click "Show Bank Details" to copy account information</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-neutral-300 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Step 2: Make Bank Transfer</h4>
                    <p className="text-sm text-neutral">Transfer the amount to our cooperative bank account</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-neutral-300 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Step 3: Confirm Transfer</h4>
                    <p className="text-sm text-neutral">Mark the payment as completed in this form</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-neutral-300 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Step 4: Admin Verification</h4>
                    <p className="text-sm text-neutral">Admin will verify the bank transfer and approve payment</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-success/5 border-success/20">
            <CardHeader>
              <CardTitle className="flex items-center text-success">
                <CheckCircle className="mr-2 h-5 w-5" />
                Secure Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-success">
                All bank transfers are verified by our admin team before being processed. 
                Only bank transfer payments are accepted for security and transparency.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}