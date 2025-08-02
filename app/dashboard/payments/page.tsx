'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { CreditCard, CheckCircle, AlertCircle, Copy, Upload, X } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { databases, appwriteConfig, storage } from '@/lib/appwrite';
import { registrationService, loansService } from '@/lib/services';
import { ID } from 'appwrite';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [selectedPaymentType, setSelectedPaymentType] = useState<'Registration' | 'Savings' | 'Loan_Repayment'>('Registration');
  const [amount, setAmount] = useState('');
  const [paymentMade, setPaymentMade] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasConfirmedRegistration, setHasConfirmedRegistration] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');

  // Bank details (to be provided by you)
  const bankDetails = {
    accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || 'Cooperative Society Account',
    accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || 'Account number to be provided',
    bankName: process.env.NEXT_PUBLIC_BANK_NAME || 'Bank name to be provided',
  };

  const registrationFee = parseFloat(process.env.NEXT_PUBLIC_REGISTRATION_FEE || '50');

  // Load member data and active loans
  useEffect(() => {
    const loadMemberData = async () => {
      if (!user?.memberId) return;
      
      try {
        const [confirmedRegistrations, loanSummary] = await Promise.all([
          registrationService.getConfirmedRegistrationPayments(),
          loansService.getMemberLoanSummary(user.memberId)
        ]);
        
        const hasConfirmed = confirmedRegistrations.some(payment => payment.memberId === user.memberId);
        setHasConfirmedRegistration(hasConfirmed);
        
        // Get active loans (approved loans with outstanding balance)
        const activeLoansData = loanSummary.loanRequests.filter(loan => 
          loan.status === 'Approved' && (loan.currentBalance || 0) > 0
        );
        setActiveLoans(activeLoansData);
        
        // Auto-select first active loan if there's only one
        if (activeLoansData.length === 1) {
          setSelectedLoanId(activeLoansData[0].$id);
        }
        
        // If registration is confirmed, default to Savings
        if (hasConfirmed && selectedPaymentType === 'Registration') {
          setSelectedPaymentType('Savings');
        }
      } catch (error) {
        console.error('Error loading member data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMemberData();
  }, [user?.memberId, selectedPaymentType]);

  const paymentTypes = [
    {
      id: 'Registration' as const,
      title: 'Registration Fee',
      description: hasConfirmedRegistration ? 'Paid - Registration completed' : 'One-time membership registration fee',
      amount: registrationFee,
      disabled: hasConfirmedRegistration,
    },
    {
      id: 'Savings' as const,
      title: 'Savings Deposit',
      description: 'Add money to your savings account',
      amount: null,
      disabled: false,
    },
    {
      id: 'Loan_Repayment' as const,
      title: 'Loan Repayment',
      description: activeLoans.length > 0 
        ? `Make a payment towards your loan (${activeLoans.length} active loan${activeLoans.length !== 1 ? 's' : ''})`
        : 'No active loans to repay',
      amount: null,
      disabled: activeLoans.length === 0,
    },
  ].filter(type => !type.disabled);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== PAYMENT SUBMISSION DEBUG ===');
    console.log('Selected payment type:', selectedPaymentType);
    console.log('Has confirmed registration:', hasConfirmedRegistration);
    console.log('Available payment types:', paymentTypes.map(p => p.id));
    
    // Prevent duplicate registration payments
    if (selectedPaymentType === 'Registration' && hasConfirmedRegistration) {
      alert('Registration fee has already been paid. Please select a different payment type.');
      return;
    }
    
    // Validate loan repayment selection
    if (selectedPaymentType === 'Loan_Repayment') {
      if (activeLoans.length === 0) {
        alert('You have no active loans to repay.');
        return;
      }
      if (!selectedLoanId) {
        alert('Please select which loan you want to make a payment towards.');
        return;
      }
    }
    
    setIsSubmitting(true);

    try {
      let proofFileId = null;

      // Upload proof file if provided
      if (proofFile) {
        setIsUploadingProof(true);
        try {
          const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            proofFile
          );
          proofFileId = uploadedFile.$id;
          console.log('Successfully uploaded proof file:', proofFileId);
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          alert('Failed to upload payment proof. Please try again.');
          setIsUploadingProof(false);
          setIsSubmitting(false);
          return;
        } finally {
          setIsUploadingProof(false);
        }
      }

      // Create payment record in Appwrite database
      const paymentData: any = {
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
        description: `${selectedPaymentType.replace('_', ' ')} payment of ₦${amount}`,
      };

      // Add loan request ID for loan repayments
      if (selectedPaymentType === 'Loan_Repayment' && selectedLoanId) {
        paymentData.loanRequestId = selectedLoanId;
        const selectedLoan = activeLoans.find(loan => loan.$id === selectedLoanId);
        if (selectedLoan) {
          paymentData.description = `Loan repayment of ₦${amount} for loan of ₦${selectedLoan.approvedAmount} (Balance: ₦${selectedLoan.currentBalance})`;
        }
      }

      // Add proof data if file was uploaded
      if (proofFileId) {
        paymentData.proofFileId = proofFileId;
        paymentData.proofFileName = proofFile?.name || null;
      }

      // Determine the correct collection based on payment type
      let collectionId;
      let fallbackCollectionId = appwriteConfig.paymentsCollectionId;
      
      switch (selectedPaymentType) {
        case 'Registration':
          collectionId = appwriteConfig.paymentsCollectionId;
          break;
        case 'Savings':
          collectionId = appwriteConfig.savingsCollectionId;
          break;
        case 'Loan_Repayment':
          collectionId = appwriteConfig.loansCollectionId;
          break;
        default:
          collectionId = appwriteConfig.paymentsCollectionId;
      }
      
      console.log(`Attempting to save ${selectedPaymentType} payment to collection:`, collectionId);
      console.log('Database ID:', appwriteConfig.databaseId);
      console.log('Fallback collection ID:', fallbackCollectionId);
      
      // Try to save to the primary collection first, fallback to payments collection if it fails
      try {
        await databases.createDocument(
          appwriteConfig.databaseId,
          collectionId,
          ID.unique(),
          paymentData
        );
        console.log(`Successfully saved to ${collectionId}`);
      } catch (collectionError: any) {
        console.warn(`Failed to save to ${collectionId}:`, collectionError);
        
        // If the primary collection doesn't exist, try the fallback
        if (collectionError.code === 404 && collectionError.type === 'collection_not_found') {
          console.log(`Collection ${collectionId} not found, trying fallback to ${fallbackCollectionId}`);
          
          try {
            await databases.createDocument(
              appwriteConfig.databaseId,
              fallbackCollectionId,
              ID.unique(),
              paymentData
            );
            console.log(`Successfully saved to fallback collection ${fallbackCollectionId}`);
          } catch (fallbackError) {
            console.error('Fallback collection also failed:', fallbackError);
            
            // Clean up uploaded file if both saves failed
            if (proofFileId) {
              try {
                await storage.deleteFile(appwriteConfig.storageId, proofFileId);
                console.log('Cleaned up uploaded file after all saves failed');
              } catch (cleanupError) {
                console.error('Failed to clean up uploaded file:', cleanupError);
              }
            }
            
            throw new Error(`Failed to save payment. Both primary collection (${collectionId}) and fallback collection (${fallbackCollectionId}) are not accessible. Please contact support.`);
          }
        } else {
          // Re-throw the original error if it's not a collection not found error
          throw collectionError;
        }
      }
      
      // Show success message
      alert('Payment submission successful! Please wait for admin confirmation.');
      
      // Reset form
      setAmount('');
      setPaymentMade(false);
      setShowBankDetails(false);
      setProofFile(null);
      setProofPreview(null);
      setSelectedLoanId('');
      
    } catch (error: any) {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only images (JPG, PNG) or PDF files');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setProofFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setProofPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  const removeProofFile = () => {
    setProofFile(null);
    setProofPreview(null);
  };

  const handlePaymentTypeChange = (type: 'Registration' | 'Savings' | 'Loan_Repayment') => {
    setSelectedPaymentType(type);
    setSelectedLoanId(''); // Reset loan selection when payment type changes
    
    // Auto-select first loan if switching to loan repayment and there's only one loan
    if (type === 'Loan_Repayment' && activeLoans.length === 1) {
      setSelectedLoanId(activeLoans[0].$id);
    }
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
              {isLoading ? (
                <div className="p-4 text-center text-neutral">
                  Loading payment options...
                </div>
              ) : (
                paymentTypes.map((type) => (
                <div
                  key={type.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPaymentType === type.id
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/50'
                  }`}
                  onClick={() => handlePaymentTypeChange(type.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{type.title}</h3>
                      <p className="text-sm text-neutral">{type.description}</p>
                    </div>
                    {type.amount && (
                      <div className="text-lg font-semibold text-accent">
                        ₦{type.amount}
                      </div>
                    )}
                  </div>
                </div>
              ))
              )}
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

                {/* Loan Selection for Loan Repayments */}
                {selectedPaymentType === 'Loan_Repayment' && activeLoans.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">Select Loan to Repay</label>
                    <div className="space-y-2">
                      {activeLoans.map((loan) => (
                        <div
                          key={loan.$id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedLoanId === loan.$id
                              ? 'border-accent bg-accent/10'
                              : 'border-border hover:border-accent/50'
                          }`}
                          onClick={() => setSelectedLoanId(loan.$id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Loan Amount: ₦{loan.approvedAmount?.toLocaleString()}</p>
                              <p className="text-sm text-neutral">Purpose: {loan.purpose}</p>
                              <p className="text-sm text-neutral">Approved: {new Date(loan.approvedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-red-600">₦{(loan.currentBalance || 0).toLocaleString()}</p>
                              <p className="text-xs text-neutral">Outstanding</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

                {/* Payment Proof Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Upload Payment Proof (Optional)</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-accent/50 transition-colors">
                    {!proofFile ? (
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-neutral mb-2" />
                        <p className="text-sm text-neutral mb-2">
                          Upload receipt, screenshot, or bank transfer proof
                        </p>
                        <p className="text-xs text-neutral mb-3">
                          Supports: JPG, PNG, PDF (max 5MB)
                        </p>
                        <input
                          type="file"
                          id="proofUpload"
                          accept="image/*,.pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('proofUpload')?.click()}
                        >
                          Choose File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-accent/10 rounded flex items-center justify-center">
                              <Upload className="h-4 w-4 text-accent" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{proofFile.name}</p>
                              <p className="text-xs text-neutral">
                                {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeProofFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {proofPreview && (
                          <div className="mt-2">
                            <img
                              src={proofPreview}
                              alt="Payment proof preview"
                              className="max-w-full h-32 object-contain rounded border"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

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
                  disabled={!paymentMade || !amount || isSubmitting || isUploadingProof}
                  isLoading={isSubmitting || isUploadingProof}
                >
                  {isUploadingProof 
                    ? 'Uploading Proof...' 
                    : isSubmitting 
                    ? 'Submitting...' 
                    : 'Submit Bank Transfer Confirmation'
                  }
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