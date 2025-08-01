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