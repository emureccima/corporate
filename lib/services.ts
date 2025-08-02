import { databases, appwriteConfig } from './appwrite';
import { Query } from 'appwrite';

// Member Services
export const memberService = {
  // Get all members (admin only)
  async getAllMembers() {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.membersCollectionId
      );
      return result.documents;
    } catch (error) {
      console.error('Error fetching members:', error);
      return [];
    }
  },

  // Get member count
  async getMemberCount() {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.membersCollectionId,
        [Query.limit(1)]
      );
      return result.total;
    } catch (error) {
      console.error('Error getting member count:', error);
      return 0;
    }
  },

  // Get active members count
  async getActiveMemberCount() {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.membersCollectionId,
        [Query.equal('status', 'Active'), Query.limit(1)]
      );
      return result.total;
    } catch (error) {
      console.error('Error getting active member count:', error);
      return 0;
    }
  },

  // Get member by ID
  async getMemberById(memberId: string) {
    try {
      const result = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.membersCollectionId,
        memberId
      );
      return result;
    } catch (error) {
      console.error('Error fetching member:', error);
      return null;
    }
  },

  // Update member profile
  async updateMember(memberId: string, updateData: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
  }) {
    try {
      const result = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.membersCollectionId,
        memberId,
        {
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      );
      return result;
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  }
};

// Payment Services
export const paymentService = {
  // Get all payments (admin only)
  async getAllPayments() {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.paymentsCollectionId,
        [Query.orderDesc('$createdAt')]
      );
      return result.documents;
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  },

  // Get member payments
  async getMemberPayments(memberId: string) {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.paymentsCollectionId,
        [
          Query.equal('memberId', memberId),
          Query.orderDesc('$createdAt')
        ]
      );
      return result.documents;
    } catch (error) {
      console.error('Error fetching member payments:', error);
      return [];
    }
  },

  // Get pending payments count
  async getPendingPaymentsCount() {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.paymentsCollectionId,
        [Query.equal('status', 'Pending'), Query.limit(1)]
      );
      return result.total;
    } catch (error) {
      console.error('Error getting pending payments count:', error);
      return 0;
    }
  },

  // Get total payment amount
  async getTotalPaymentAmount() {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.paymentsCollectionId,
        [Query.equal('confirmed', true)]
      );
      
      const total = result.documents.reduce((sum, payment) => {
        return sum + (payment.amount || 0);
      }, 0);
      
      return total;
    } catch (error) {
      console.error('Error calculating total payment amount:', error);
      return 0;
    }
  },

  // Get recent payments
  async getRecentPayments(limit: number = 5) {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.paymentsCollectionId,
        [
          Query.orderDesc('$createdAt'),
          Query.limit(limit)
        ]
      );
      return result.documents;
    } catch (error) {
      console.error('Error fetching recent payments:', error);
      return [];
    }
  }
};

// Registration Fee Services
export const registrationService = {
  // Get registration fee payments
  async getRegistrationPayments() {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.paymentsCollectionId,
        [
          Query.equal('paymentType', 'Registration'),
          Query.orderDesc('$createdAt')
        ]
      );
      return result.documents;
    } catch (error) {
      console.error('Error fetching registration payments:', error);
      return [];
    }
  },

  // Get pending registration fee payments
  async getPendingRegistrationPayments() {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.paymentsCollectionId,
        [
          Query.equal('paymentType', 'Registration'),
          Query.equal('status', 'Pending'),
          Query.orderDesc('$createdAt')
        ]
      );
      return result.documents;
    } catch (error) {
      console.error('Error fetching pending registration payments:', error);
      return [];
    }
  },

  // Get confirmed registration fee payments
  async getConfirmedRegistrationPayments() {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.paymentsCollectionId,
        [
          Query.equal('paymentType', 'Registration'),
          Query.equal('status', 'Confirmed'),
          Query.orderDesc('$createdAt')
        ]
      );
      return result.documents;
    } catch (error) {
      console.error('Error fetching confirmed registration payments:', error);
      return [];
    }
  },

  // Get registration fee stats
  async getRegistrationStats() {
    try {
      const [allRegistrations, pendingRegistrations, confirmedRegistrations] = await Promise.all([
        this.getRegistrationPayments(),
        this.getPendingRegistrationPayments(),
        this.getConfirmedRegistrationPayments()
      ]);

      const totalAmount = confirmedRegistrations.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const pendingAmount = pendingRegistrations.reduce((sum, payment) => sum + (payment.amount || 0), 0);

      return {
        totalRegistrations: allRegistrations.length,
        confirmedRegistrations: confirmedRegistrations.length,
        pendingRegistrations: pendingRegistrations.length,
        totalAmount,
        pendingAmount,
        registrationFee: parseFloat(process.env.NEXT_PUBLIC_REGISTRATION_FEE || '50')
      };
    } catch (error) {
      console.error('Error fetching registration stats:', error);
      return {
        totalRegistrations: 0,
        confirmedRegistrations: 0,
        pendingRegistrations: 0,
        totalAmount: 0,
        pendingAmount: 0,
        registrationFee: 50
      };
    }
  },

  // Confirm registration payment and activate member
  async confirmRegistrationPayment(paymentId: string) {
    try {
      // First, update the payment status
      const updatedPayment = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.paymentsCollectionId,
        paymentId,
        {
          status: 'Confirmed',
          confirmed: true,
          confirmedAt: new Date().toISOString()
        }
      );

      // If payment is confirmed and it's a registration payment, activate the member
      if (updatedPayment.paymentType === 'Registration' && updatedPayment.memberId) {
        try {
          await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.membersCollectionId,
            updatedPayment.memberId,
            {
              status: 'Active',
              activatedAt: new Date().toISOString()
            }
          );
          console.log(`Member ${updatedPayment.memberId} activated after registration fee confirmation`);
        } catch (memberError) {
          console.error('Error activating member:', memberError);
          // Payment is still confirmed even if member activation fails
        }
      }

      return updatedPayment;
    } catch (error) {
      console.error('Error confirming registration payment:', error);
      throw error;
    }
  }
};

// Savings Services
export const savingsService = {
  // Get all savings payments
  async getAllSavingsPayments() {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.savingsCollectionId,
        [Query.orderDesc('$createdAt')]
      );
      return result.documents;
    } catch (error) {
      console.error('Error fetching savings payments:', error);
      return [];
    }
  },

  // Get member savings payments
  async getMemberSavingsPayments(memberId: string) {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.savingsCollectionId,
        [
          Query.equal('memberId', memberId),
          Query.orderDesc('$createdAt')
        ]
      );
      return result.documents;
    } catch (error) {
      console.error('Error fetching member savings:', error);
      return [];
    }
  },

  // Get savings statistics
  async getSavingsStats() {
    try {
      const [allSavings, confirmedSavings] = await Promise.all([
        this.getAllSavingsPayments(),
        databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.savingsCollectionId,
          [Query.equal('status', 'Confirmed')]
        )
      ]);

      const totalAmount = confirmedSavings.documents.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const pendingAmount = allSavings.filter(p => p.status === 'Pending').reduce((sum, payment) => sum + (payment.amount || 0), 0);

      return {
        totalSavings: allSavings.length,
        confirmedSavings: confirmedSavings.documents.length,
        pendingSavings: allSavings.filter(p => p.status === 'Pending').length,
        totalAmount,
        pendingAmount
      };
    } catch (error) {
      console.error('Error fetching savings stats:', error);
      return {
        totalSavings: 0,
        confirmedSavings: 0,
        pendingSavings: 0,
        totalAmount: 0,
        pendingAmount: 0
      };
    }
  },

  // Confirm savings payment
  async confirmSavingsPayment(paymentId: string) {
    try {
      const updatedPayment = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.savingsCollectionId,
        paymentId,
        {
          status: 'Confirmed',
          confirmed: true,
          confirmedAt: new Date().toISOString()
        }
      );
      return updatedPayment;
    } catch (error) {
      console.error('Error confirming savings payment:', error);
      throw error;
    }
  }
};

// Loans Services
export const loansService = {
  // Get all loan payments (repayments)
  async getAllLoanPayments() {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.loansCollectionId,
        [Query.orderDesc('$createdAt')]
      );
      return result.documents;
    } catch (error) {
      console.error('Error fetching loan payments:', error);
      return [];
    }
  },

  // Get member loan payments (repayments)
  async getMemberLoanPayments(memberId: string) {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.loansCollectionId,
        [
          Query.equal('memberId', memberId),
          Query.orderDesc('$createdAt')
        ]
      );
      return result.documents;
    } catch (error) {
      console.error('Error fetching member loan payments:', error);
      return [];
    }
  },

  // Get loan statistics
  async getLoanStats() {
    try {
      const [allLoans, confirmedLoans] = await Promise.all([
        this.getAllLoanPayments(),
        databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.loansCollectionId,
          [Query.equal('status', 'Confirmed')]
        )
      ]);

      const totalAmount = confirmedLoans.documents.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const pendingAmount = allLoans.filter(p => p.status === 'Pending').reduce((sum, payment) => sum + (payment.amount || 0), 0);

      return {
        totalRepayments: allLoans.length,
        confirmedRepayments: confirmedLoans.documents.length,
        pendingRepayments: allLoans.filter(p => p.status === 'Pending').length,
        totalAmount,
        pendingAmount
      };
    } catch (error) {
      console.error('Error fetching loan stats:', error);
      return {
        totalRepayments: 0,
        confirmedRepayments: 0,
        pendingRepayments: 0,
        totalAmount: 0,
        pendingAmount: 0
      };
    }
  },

  // Confirm loan repayment and update loan balance
  async confirmLoanPayment(paymentId: string) {
    try {
      // Get the payment details first
      const payment = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.loansCollectionId,
        paymentId
      );

      // Update the payment status
      const updatedPayment = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.loansCollectionId,
        paymentId,
        {
          status: 'Confirmed',
          confirmed: true,
          confirmedAt: new Date().toISOString()
        }
      );

      // Update the corresponding loan request balance if it exists
      if (payment.loanRequestId) {
        try {
          const loanRequest = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.loanRequestsCollectionId,
            payment.loanRequestId
          );
          
          const currentBalance = loanRequest.currentBalance || loanRequest.approvedAmount;
          const newBalance = currentBalance - payment.amount;
          
          await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.loanRequestsCollectionId,
            payment.loanRequestId,
            {
              currentBalance: Math.max(0, newBalance), // Ensure balance doesn't go negative
              lastRepaymentDate: new Date().toISOString(),
              status: newBalance <= 0 ? 'Fully Repaid' : loanRequest.status
            }
          );
        } catch (loanUpdateError) {
          console.error('Error updating loan balance:', loanUpdateError);
          // Payment confirmation still succeeded even if balance update failed
        }
      }

      return updatedPayment;
    } catch (error) {
      console.error('Error confirming loan payment:', error);
      throw error;
    }
  },

  // Get all loan requests
  async getAllLoanRequests() {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.loanRequestsCollectionId,
        [Query.orderDesc('$createdAt')]
      );
      return result.documents;
    } catch (error) {
      console.error('Error fetching loan requests:', error);
      return [];
    }
  },

  // Get member loan requests
  async getMemberLoanRequests(memberId: string) {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.loanRequestsCollectionId,
        [
          Query.equal('memberId', memberId),
          Query.orderDesc('$createdAt')
        ]
      );
      return result.documents;
    } catch (error) {
      console.error('Error fetching member loan requests:', error);
      return [];
    }
  },

  // Submit loan request
  async submitLoanRequest(loanData: {
    memberId: string;
    memberName: string;
    requestedAmount: number;
    purpose: string;
    repaymentPeriod: number;
    monthlyIncome: number;
    collateral?: string;
    guarantor?: string;
    guarantorContact?: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) {
    try {
      const loanRequest = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.loanRequestsCollectionId,
        'unique()',
        {
          ...loanData,
          status: 'Pending Review',
          submittedAt: new Date().toISOString(),
          currentBalance: 0,
          approvedAmount: 0
        }
      );
      return loanRequest;
    } catch (error) {
      console.error('Error submitting loan request:', error);
      throw error;
    }
  },

  // Approve loan request
  async approveLoanRequest(loanRequestId: string, approvedAmount: number, notes?: string) {
    try {
      const updatedRequest = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.loanRequestsCollectionId,
        loanRequestId,
        {
          status: 'Approved',
          approvedAmount,
          currentBalance: approvedAmount,
          approvedAt: new Date().toISOString(),
          adminNotes: notes || ''
        }
      );
      return updatedRequest;
    } catch (error) {
      console.error('Error approving loan request:', error);
      throw error;
    }
  },

  // Reject loan request
  async rejectLoanRequest(loanRequestId: string, notes?: string) {
    try {
      const updatedRequest = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.loanRequestsCollectionId,
        loanRequestId,
        {
          status: 'Rejected',
          rejectedAt: new Date().toISOString(),
          adminNotes: notes || ''
        }
      );
      return updatedRequest;
    } catch (error) {
      console.error('Error rejecting loan request:', error);
      throw error;
    }
  },

  // Get member loan summary (active loans and total debt)
  async getMemberLoanSummary(memberId: string) {
    try {
      const [loanRequests, repayments] = await Promise.all([
        this.getMemberLoanRequests(memberId),
        this.getMemberLoanPayments(memberId)
      ]);

      const approvedLoans = loanRequests.filter(loan => loan.status === 'Approved' || loan.status === 'Fully Repaid');
      const activeLoans = loanRequests.filter(loan => loan.status === 'Approved');
      const totalBorrowed = approvedLoans.reduce((sum, loan) => sum + (loan.approvedAmount || 0), 0);
      const totalOutstanding = activeLoans.reduce((sum, loan) => sum + (loan.currentBalance || 0), 0);
      const totalRepaid = repayments.filter(payment => payment.status === 'Confirmed')
                                   .reduce((sum, payment) => sum + (payment.amount || 0), 0);

      return {
        totalBorrowed,
        totalOutstanding,
        totalRepaid,
        activeLoans: activeLoans.length,
        totalLoans: approvedLoans.length,
        pendingRequests: loanRequests.filter(loan => loan.status === 'Pending Review').length,
        loanRequests,
        repayments
      };
    } catch (error) {
      console.error('Error fetching member loan summary:', error);
      return {
        totalBorrowed: 0,
        totalOutstanding: 0,
        totalRepaid: 0,
        activeLoans: 0,
        totalLoans: 0,
        pendingRequests: 0,
        loanRequests: [],
        repayments: []
      };
    }
  }
};

// Stats Services
export const statsService = {
  // Get dashboard stats for admin
  async getAdminStats() {
    try {
      const [
        totalMembers,
        activeMembers,
        pendingPayments,
        totalAmount
      ] = await Promise.all([
        memberService.getMemberCount(),
        memberService.getActiveMemberCount(),
        paymentService.getPendingPaymentsCount(),
        paymentService.getTotalPaymentAmount()
      ]);

      return {
        totalMembers,
        activeMembers,
        pendingPayments,
        totalAmount
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {
        totalMembers: 0,
        activeMembers: 0,
        pendingPayments: 0,
        totalAmount: 0
      };
    }
  },

  // Get dashboard stats for member
  async getMemberStats(memberId: string) {
    try {
      const payments = await paymentService.getMemberPayments(memberId);
      
      const totalPaid = payments
        .filter(p => p.confirmed)
        .reduce((sum, payment) => sum + (payment.amount || 0), 0);
        
      const pendingPayments = payments.filter(p => p.status === 'Pending').length;
      
      return {
        totalPaid,
        pendingPayments,
        totalTransactions: payments.length,
        lastPayment: payments[0] || null
      };
    } catch (error) {
      console.error('Error fetching member stats:', error);
      return {
        totalPaid: 0,
        pendingPayments: 0,
        totalTransactions: 0,
        lastPayment: null
      };
    }
  }
};