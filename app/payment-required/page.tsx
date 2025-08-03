'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { registrationService } from '@/lib/services';
import { Upload, FileText, X } from 'lucide-react';

const CHAMBER_BANK_DETAILS = {
  accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "EKITI CHAMBERS OF COMMERCE INDUSTRY, MINES AND AGRICULTURE",
  accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "0160054598",
  bankName: process.env.NEXT_PUBLIC_BANK_NAME|| "Premium Trust Bank",
  registrationFee: "₦15,000"
};

export default function PaymentRequiredPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [registrationPayment, setRegistrationPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // If user is already active, redirect to dashboard
    if (user?.status === 'Active') {
      router.push('/dashboard');
    } else if (user?.memberId) {
      loadRegistrationPayment();
    }
  }, [user?.status, user?.memberId, router]);

  const loadRegistrationPayment = async () => {
    if (!user?.memberId) return;
    
    try {
      setLoading(true);
      const payment = await registrationService.getMemberRegistrationPayment(user.memberId);
      setRegistrationPayment(payment);
    } catch (error) {
      console.error('Error loading registration payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid file type (JPG, PNG, or PDF)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    toast.success('Payment proof selected');
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitPayment = async () => {
    if (!user?.memberId || !user?.name || !user?.membershipNumber) {
      toast.error('Missing user information');
      return;
    }

    if (!selectedFile) {
      toast.error('Please upload payment proof before submitting');
      return;
    }

    try {
      setSubmitting(true);
      setUploadProgress(10);
      
      const result = await registrationService.submitRegistrationPayment({
        memberId: user.memberId,
        memberName: user.name,
        membershipNumber: user.membershipNumber,
        amount: 15000, // ₦15,000
        bankAccountNumber: CHAMBER_BANK_DETAILS.accountNumber,
        transferType: 'Online',
        description: 'Registration fee payment submitted for review',
        paymentProofFile: selectedFile
      });
      
      console.log('Payment submission result:', result);
      setUploadProgress(100);
      toast.success('Registration payment submitted for admin review');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await loadRegistrationPayment();
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Registration Payment Required
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome to Emure Chambers of Commerce! To activate your membership and access all chamber services, please complete your registration payment.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              Your Account Details
            </h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {user.name}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Membership Number:</span> {user.membershipNumber}</p>
              <p><span className="font-medium">Status:</span> 
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {user.status || 'Pending'}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-green-900 mb-4">
              Payment Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Registration Fee:</span>
                <span className="text-xl font-bold text-green-700">
                  {CHAMBER_BANK_DETAILS.registrationFee}
                </span>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Bank Account Details:</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Account Name:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono">{CHAMBER_BANK_DETAILS.accountName}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(CHAMBER_BANK_DETAILS.accountName, 'Account name')}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Account Number:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono">{CHAMBER_BANK_DETAILS.accountNumber}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(CHAMBER_BANK_DETAILS.accountNumber, 'Account number')}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Bank Name:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono">{CHAMBER_BANK_DETAILS.bankName}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(CHAMBER_BANK_DETAILS.bankName, 'Bank name')}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-amber-800 mb-2">Important Instructions:</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Make payment to the account details provided above</li>
              <li>• Use your membership number ({user.membershipNumber}) as payment reference</li>
              <li>• Upload proof of payment (receipt/screenshot) below</li>
              <li>• After uploading proof, click "Submit Payment Confirmation"</li>
              <li>• Your account will be activated within 24 hours after admin approval</li>
            </ul>
          </div>

          {/* File Upload Section */}
          {(!registrationPayment || registrationPayment.status === 'Rejected') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-800 mb-4">Upload Payment Proof</h3>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    id="payment-proof"
                  />
                  
                  {!selectedFile ? (
                    <div>
                      <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <label
                        htmlFor="payment-proof"
                        className="cursor-pointer text-blue-600 hover:text-blue-700"
                      >
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </label>
                      <p className="text-sm text-blue-500 mt-2">
                        JPG, PNG or PDF (max 5MB)
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-6 w-6 text-blue-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeSelectedFile}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Status Section */}
          {registrationPayment && (
            <div className={`border rounded-lg p-4 mb-6 ${
              registrationPayment.status === 'Confirmed' 
                ? 'bg-green-50 border-green-200'
                : registrationPayment.status === 'Pending'
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                registrationPayment.status === 'Confirmed'
                  ? 'text-green-800'
                  : registrationPayment.status === 'Pending'
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }`}>
                Payment Status: {registrationPayment.status}
              </h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Amount:</span> ₦{registrationPayment.amount.toLocaleString()}</p>
                <p><span className="font-medium">Submitted:</span> {new Date(registrationPayment.$createdAt).toLocaleDateString()}</p>
                {registrationPayment.paymentProofFileName && (
                  <p><span className="font-medium">Payment Proof:</span> {registrationPayment.paymentProofFileName}</p>
                )}
                {registrationPayment.status === 'Pending' && (
                  <p className="text-yellow-700">Your payment is being reviewed by the admin.</p>
                )}
                {registrationPayment.status === 'Confirmed' && (
                  <p className="text-green-700">Your payment has been approved! Your account will be activated shortly.</p>
                )}
                {registrationPayment.status === 'Rejected' && registrationPayment.rejectionReason && (
                  <p className="text-red-700"><span className="font-medium">Reason:</span> {registrationPayment.rejectionReason}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            {!registrationPayment || registrationPayment.status === 'Rejected' ? (
              <Button
                onClick={handleSubmitPayment}
                disabled={submitting || !selectedFile}
                className="flex-1"
              >
                {submitting ? 'Uploading...' : 'Submit Payment Confirmation'}
              </Button>
            ) : (
              <Button
                onClick={loadRegistrationPayment}
                className="flex-1"
              >
                Refresh Status
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex-1"
            >
              Logout
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}