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
  $createdAt?: string;
  $updatedAt?: string;
}

export interface PaymentRecord {
  $id?: string;
  memberId: string;
  memberName: string;
  paymentType: 'Registration' | 'Savings' | 'Loan_Repayment';
  amount: number;
  bankAccountNumber: string;
  transferType: 'Online' | 'Offline';
  paymentMade: boolean;
  confirmed: boolean;
  status: 'Pending' | 'Confirmed' | 'Rejected';
  date: string;
  description?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface AuthUser {
  $id: string;
  email: string;
  name: string;
  role: 'member' | 'admin';
  memberId?: string;
  status?: 'Active' | 'Inactive' | 'Pending';
}

export interface BankAccount {
  accountName: string;
  accountNumber: string;
  bankName: string;
}