export interface Member {
  $id?: string;
  membershipNumber: string;
  fullName: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'Active' | 'Inactive';
  role: 'member' | 'admin';
  $createdAt?: string;
  $updatedAt?: string;
}

export interface Event {
  $id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  $createdAt?: string;
  $updatedAt?: string;
}

export interface SavingsRecord {
  $id?: string;
  memberId: string;
  memberName: string;
  date: string;
  description: string;
  deposit: number;
  withdrawal: number;
  balance: number;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface LoanRecord {
  $id?: string;
  memberId: string;
  memberName: string;
  loanAmount: number;
  interestRate: number;
  duration: number;
  monthlyPayment: number;
  totalRepayment: number;
  remainingBalance: number;
  status: 'Active' | 'Paid' | 'Overdue';
  startDate: string;
  endDate: string;
  totalRepaid?: number; // Track total amount repaid
  $createdAt?: string;
  $updatedAt?: string;
}

export interface PaymentRecord {
  $id?: string;
  memberId: string;
  memberName: string;
  paymentType: 'Savings' | 'Loan_Repayment' | 'Registration_Fee';
  amount: number;
  bankAccountNumber: string;
  transferType: 'Online' | 'Offline';
  paymentMade: boolean;
  confirmed: boolean;
  status: 'Pending' | 'Confirmed' | 'Rejected';
  date: string;
  description?: string;
  rejectionReason?: string;
  paymentProofFileId?: string;
  paymentProofFileName?: string;
  loanRequestId?: string; // Links loan repayments to specific loan requests
  $createdAt?: string;
  $updatedAt?: string;
}

export interface AuthUser {
  $id: string;
  email: string;
  name: string;
  role: 'member' | 'admin';
  memberId?: string; // System-generated ID for database operations
  membershipNumber?: string; // Human-readable ID like CH01
  status?: 'Active' | 'Inactive' | 'Pending';
}

export interface SavingsWithdrawal {
  $id?: string;
  memberId: string;
  memberName: string;
  membershipNumber?: string;
  requestedAmount: number;
  accountNumber: string;
  accountName: string;
  bankName: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  availableBalance: number; // Savings balance at time of request
  requestedAt: string;
  processedAt?: string;
  adminNotes?: string;
  rejectionReason?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface BankAccount {
  accountName: string;
  accountNumber: string;
  bankName: string;
}