import { databases, storage, appwriteConfig } from './appwrite';
import { Query, ID } from 'appwrite';

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
  },

  // Update member status
  async updateMemberStatus(memberId: string, status: 'Active' | 'Inactive' | 'Pending') {
    try {
      const result = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.membersCollectionId,
        memberId,
        {
          status,
          updatedAt: new Date().toISOString()
        }
      );
      return result;
    } catch (error) {
      console.error('Error updating member status:', error);
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

      // Validate that this is a loan repayment
      if (payment.paymentType !== 'Loan_Repayment') {
        throw new Error('This payment is not a loan repayment');
      }

      // Check if loanRequestId exists
      if (!payment.loanRequestId) {
        console.warn(`Loan repayment ${paymentId} missing loanRequestId - cannot update loan balance`);
        
        // Still confirm the payment but don't update loan balance
        const updatedPayment = await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.loansCollectionId,
          paymentId,
          {
            status: 'Confirmed',
            confirmed: true,
            confirmedAt: new Date().toISOString(),
            description: `${payment.description || 'Loan repayment'} (Warning: No loan linked - balance not updated)`
          }
        );
        
        throw new Error('Payment confirmed but loan balance could not be updated - loanRequestId missing. Please link this repayment to a loan manually.');
      }

      // Get the loan request and validate it exists
      let loanRequest;
      try {
        loanRequest = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.loanRequestsCollectionId,
          payment.loanRequestId
        );
      } catch (loanError) {
        console.error('Error fetching loan request:', loanError);
        throw new Error(`Linked loan request ${payment.loanRequestId} not found`);
      }

      // Validate loan is in correct state for repayment
      if (loanRequest.status !== 'Approved') {
        throw new Error(`Cannot process repayment - loan status is '${loanRequest.status}', expected 'Approved'`);
      }

      const currentBalance = loanRequest.currentBalance || loanRequest.approvedAmount || 0;
      
      // Validate repayment amount doesn't exceed balance
      if (payment.amount > currentBalance) {
        throw new Error(`Repayment amount ₦${payment.amount} exceeds outstanding balance ₦${currentBalance}`);
      }

      const newBalance = currentBalance - payment.amount;
      const isFullyRepaid = newBalance <= 0;

      // Update loan balance first (before confirming payment to ensure consistency)
      try {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.loanRequestsCollectionId,
          payment.loanRequestId,
          {
            currentBalance: Math.max(0, newBalance),
            lastRepaymentDate: new Date().toISOString(),
            status: isFullyRepaid ? 'Fully Repaid' : loanRequest.status
            // totalRepaid: (loanRequest.totalRepaid || 0) + payment.amount // Commented out until field is added to Appwrite
          }
        );
      } catch (loanUpdateError) {
        console.error('Critical error updating loan balance:', loanUpdateError);
        throw new Error(`Failed to update loan balance: ${loanUpdateError}`);
      }

      // Now confirm the payment
      const updatedPayment = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.loansCollectionId,
        paymentId,
        {
          status: 'Confirmed',
          confirmed: true,
          confirmedAt: new Date().toISOString(),
          description: `${payment.description || 'Loan repayment'} - Balance updated from ₦${currentBalance} to ₦${Math.max(0, newBalance)}`
        }
      );

      console.log(`Successfully processed loan repayment: ₦${payment.amount} for loan ${payment.loanRequestId}`);
      console.log(`Loan balance updated: ₦${currentBalance} → ₦${Math.max(0, newBalance)}`);
      
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
    membershipNumber?: string;
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
        Promise.resolve(0), // Pending payments count removed
        Promise.resolve(0)  // Total payment amount removed
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
      const payments: any[] = []; // Payment service removed
      
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

// Registration Payment Services
export const registrationService = {
  // Submit registration payment claim
  async submitRegistrationPayment(paymentData: {
    memberId: string;
    memberName: string;
    membershipNumber?: string;
    amount: number;
    bankAccountNumber: string;
    transferType: 'Online' | 'Offline';
    description?: string;
    paymentProofFile?: File;
  }) {
    try {
      let paymentProofData = {};
      
      // Upload payment proof if provided
      if (paymentData.paymentProofFile) {
        const fileId = ID.unique();
        const uploadResult = await storage.createFile(
          appwriteConfig.storageId,
          fileId,
          paymentData.paymentProofFile
        );
        
        // Store file ID and filename - URLs will be generated dynamically
        paymentProofData = {
          paymentProofFileId: fileId,
          paymentProofFileName: paymentData.paymentProofFile.name
        };
      }

      const payment = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.paymentsCollectionId,
        'unique()',
        {
          memberId: paymentData.memberId,
          memberName: paymentData.memberName,
          membershipNumber: paymentData.membershipNumber,
          amount: paymentData.amount,
          bankAccountNumber: paymentData.bankAccountNumber,
          transferType: paymentData.transferType,
          description: paymentData.description,
          ...paymentProofData,
          paymentType: 'Registration_Fee',
          paymentMade: true,
          confirmed: false,
          status: 'Pending',
          date: new Date().toISOString()
        }
      );
      return payment;
    } catch (error) {
      console.error('Error submitting registration payment:', error);
      throw error;
    }
  },

  // Get all registration payments (admin only)
  async getAllRegistrationPayments() {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.paymentsCollectionId,
        [
          Query.equal('paymentType', 'Registration_Fee'),
          Query.orderDesc('$createdAt')
        ]
      );
      return result.documents;
    } catch (error) {
      console.error('Error fetching registration payments:', error);
      return [];
    }
  },

  // Get pending registration payments (admin only)
  async getPendingRegistrationPayments() {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.paymentsCollectionId,
        [
          Query.equal('paymentType', 'Registration_Fee'),
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

  // Get member's registration payment
  async getMemberRegistrationPayment(memberId: string) {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.paymentsCollectionId,
        [
          Query.equal('memberId', memberId),
          Query.equal('paymentType', 'Registration_Fee'),
          Query.orderDesc('$createdAt'),
          Query.limit(1)
        ]
      );
      return result.documents[0] || null;
    } catch (error) {
      console.error('Error fetching member registration payment:', error);
      return null;
    }
  },

  // Approve registration payment (admin only)
  async approveRegistrationPayment(paymentId: string, adminNotes?: string) {
    try {
      // Update payment status
      const updatedPayment = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.paymentsCollectionId,
        paymentId,
        {
          status: 'Confirmed',
          confirmed: true,
          confirmedAt: new Date().toISOString(),
          description: adminNotes || 'Registration payment approved'
        }
      );

      // Get payment details to update member status
      const payment = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.paymentsCollectionId,
        paymentId
      );

      // Update member status to Active
      await memberService.updateMemberStatus(payment.memberId, 'Active');

      return updatedPayment;
    } catch (error) {
      console.error('Error approving registration payment:', error);
      throw error;
    }
  },

  // Reject registration payment (admin only)
  async rejectRegistrationPayment(paymentId: string, rejectionReason: string) {
    try {
      const updatedPayment = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.paymentsCollectionId,
        paymentId,
        {
          status: 'Rejected',
          confirmed: false,
          rejectedAt: new Date().toISOString(),
          rejectionReason
        }
      );

      return updatedPayment;
    } catch (error) {
      console.error('Error rejecting registration payment:', error);
      throw error;
    }
  },

  // Get registration payment statistics
  async getRegistrationStats() {
    try {
      const [allPayments, pendingPayments, approvedPayments] = await Promise.all([
        this.getAllRegistrationPayments(),
        this.getPendingRegistrationPayments(),
        databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.paymentsCollectionId,
          [
            Query.equal('paymentType', 'Registration_Fee'),
            Query.equal('status', 'Confirmed')
          ]
        )
      ]);

      const totalAmount = approvedPayments.documents.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const pendingAmount = pendingPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

      return {
        totalPayments: allPayments.length,
        pendingPayments: pendingPayments.length,
        approvedPayments: approvedPayments.documents.length,
        rejectedPayments: allPayments.filter(p => p.status === 'Rejected').length,
        totalAmount,
        pendingAmount
      };
    } catch (error) {
      console.error('Error fetching registration stats:', error);
      return {
        totalPayments: 0,
        pendingPayments: 0,
        approvedPayments: 0,
        rejectedPayments: 0,
        totalAmount: 0,
        pendingAmount: 0
      };
    }
  },

  // Generate payment proof view URL
  getPaymentProofViewUrl(fileId: string) {
    return storage.getFileView(appwriteConfig.storageId, fileId);
  },

  // Generate payment proof download URL
  getPaymentProofDownloadUrl(fileId: string) {
    return storage.getFileDownload(appwriteConfig.storageId, fileId);
  }
};

// Savings Withdrawal Services
export const withdrawalService = {
  // Calculate member's current savings balance
  async getMemberSavingsBalance(memberId: string) {
    try {
      const savingsPayments = await savingsService.getMemberSavingsPayments(memberId);
      const confirmedPayments = savingsPayments.filter(payment => payment.status === 'Confirmed');
      
      // Debug logging to trace balance calculation
      console.log('=== SAVINGS BALANCE DEBUG ===');
      console.log('Member ID:', memberId);
      console.log('Total savings records:', savingsPayments.length);
      console.log('Confirmed savings records:', confirmedPayments.length);
      
      // Sum all confirmed savings including negative amounts (withdrawals)
      let totalBalance = 0;
      confirmedPayments.forEach(payment => {
        const amount = parseFloat(payment.amount) || 0;
        totalBalance += amount;
        console.log(`Record: ${payment.description || 'Savings'} - Amount: ${payment.amount} (parsed: ${amount}) - Running total: ${totalBalance}`);
      });
      
      console.log('Final calculated balance:', totalBalance);
      console.log('=== END SAVINGS BALANCE DEBUG ===');
      
      return Math.max(0, totalBalance);
    } catch (error) {
      console.error('Error calculating savings balance:', error);
      return 0;
    }
  },

  // Request savings withdrawal
  async requestWithdrawal(withdrawalData: {
    memberId: string;
    memberName: string;
    membershipNumber?: string;
    requestedAmount: number;
    accountNumber: string;
    accountName: string;
    bankName: string;
  }) {
    try {
      // Get current savings balance
      const availableBalance = await this.getMemberSavingsBalance(withdrawalData.memberId);
      
      // Validate withdrawal amount
      if (withdrawalData.requestedAmount <= 0) {
        throw new Error('Withdrawal amount must be greater than zero');
      }
      
      if (withdrawalData.requestedAmount > availableBalance) {
        throw new Error(`Insufficient funds. Available balance: ₦${availableBalance.toLocaleString()}`);
      }

      // Create withdrawal request
      const withdrawal = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.withdrawalsCollectionId,
        'unique()',
        {
          ...withdrawalData,
          status: 'Pending',
          availableBalance,
          requestedAt: new Date().toISOString()
        }
      );
      
      return withdrawal;
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      throw error;
    }
  },

  // Get member's withdrawal history
  async getMemberWithdrawals(memberId: string) {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.withdrawalsCollectionId,
        [
          Query.equal('memberId', memberId),
          Query.orderDesc('$createdAt')
        ]
      );
      return result.documents;
    } catch (error) {
      console.error('Error fetching member withdrawals:', error);
      return [];
    }
  },

  // Get all withdrawal requests (admin)
  async getAllWithdrawals() {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.withdrawalsCollectionId,
        [Query.orderDesc('$createdAt')]
      );
      return result.documents;
    } catch (error) {
      console.error('Error fetching all withdrawals:', error);
      return [];
    }
  },

  // Get pending withdrawals (admin)
  async getPendingWithdrawals() {
    try {
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.withdrawalsCollectionId,
        [
          Query.equal('status', 'Pending'),
          Query.orderDesc('$createdAt')
        ]
      );
      return result.documents;
    } catch (error) {
      console.error('Error fetching pending withdrawals:', error);
      return [];
    }
  },

  // Approve withdrawal and deduct from savings automatically
  async approveWithdrawal(withdrawalId: string, adminNotes?: string) {
    try {
      // Get withdrawal details
      const withdrawal = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.withdrawalsCollectionId,
        withdrawalId
      );

      if (withdrawal.status !== 'Pending') {
        throw new Error(`Cannot approve withdrawal - status is '${withdrawal.status}'`);
      }

      // Verify member still has sufficient balance
      const currentBalance = await this.getMemberSavingsBalance(withdrawal.memberId);
      if (withdrawal.requestedAmount > currentBalance) {
        throw new Error(`Insufficient funds. Current balance: ₦${currentBalance.toLocaleString()}, Requested: ₦${withdrawal.requestedAmount.toLocaleString()}`);
      }

      // Create a savings deduction record
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.savingsCollectionId,
        'unique()',
        {
          memberId: withdrawal.memberId,
          memberName: withdrawal.memberName,
          membershipNumber: withdrawal.membershipNumber,
          amount: -parseFloat(withdrawal.requestedAmount.toString()), // Ensure negative float
          status: 'Confirmed',
          description: `Savings withdrawal to ${withdrawal.bankName} account ${withdrawal.accountNumber}`,
          confirmed: true,
          paymentType: 'Withdrawal',
          date: new Date().toISOString(),
          confirmedAt: new Date().toISOString()
        }
      );

      // Update withdrawal status
      const updatedWithdrawal = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.withdrawalsCollectionId,
        withdrawalId,
        {
          status: 'Approved',
          processedAt: new Date().toISOString(),
          adminNotes: adminNotes || `Withdrawal approved. ₦${withdrawal.requestedAmount.toLocaleString()} processed to ${withdrawal.bankName} account.`
        }
      );

      return updatedWithdrawal;
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      throw error;
    }
  },

  // Reject withdrawal
  async rejectWithdrawal(withdrawalId: string, rejectionReason: string) {
    try {
      const updatedWithdrawal = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.withdrawalsCollectionId,
        withdrawalId,
        {
          status: 'Rejected',
          processedAt: new Date().toISOString(),
          rejectionReason,
          adminNotes: `Withdrawal rejected: ${rejectionReason}`
        }
      );
      return updatedWithdrawal;
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      throw error;
    }
  },

  // Get withdrawal statistics
  async getWithdrawalStats() {
    try {
      const [allWithdrawals, pendingWithdrawals, approvedWithdrawals] = await Promise.all([
        this.getAllWithdrawals(),
        this.getPendingWithdrawals(),
        databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.withdrawalsCollectionId,
          [Query.equal('status', 'Approved')]
        )
      ]);

      const totalAmount = approvedWithdrawals.documents.reduce((sum, withdrawal) => sum + (withdrawal.requestedAmount || 0), 0);
      const pendingAmount = pendingWithdrawals.reduce((sum, withdrawal) => sum + (withdrawal.requestedAmount || 0), 0);

      return {
        totalWithdrawals: allWithdrawals.length,
        pendingWithdrawals: pendingWithdrawals.length,
        approvedWithdrawals: approvedWithdrawals.documents.length,
        rejectedWithdrawals: allWithdrawals.filter(w => w.status === 'Rejected').length,
        totalAmount,
        pendingAmount
      };
    } catch (error) {
      console.error('Error fetching withdrawal stats:', error);
      return {
        totalWithdrawals: 0,
        pendingWithdrawals: 0,
        approvedWithdrawals: 0,
        rejectedWithdrawals: 0,
        totalAmount: 0,
        pendingAmount: 0
      };
    }
  }
};