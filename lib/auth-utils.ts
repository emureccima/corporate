import { account } from './appwrite';

/**
 * Force logout by clearing all sessions
 * Useful when encountering session conflicts
 */
export const forceLogout = async () => {
  try {
    // Try to delete all sessions
    await account.deleteSessions();
  } catch (error) {
    // If that fails, try to delete current session
    try {
      await account.deleteSession('current');
    } catch (innerError) {
      console.log('No active sessions to delete');
    }
  }
};

/**
 * Check if user has an active session
 */
export const hasActiveSession = async (): Promise<boolean> => {
  try {
    await account.get();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Clear all sessions and reload page
 * Emergency function for session conflicts
 */
export const clearAllSessionsAndReload = async () => {
  await forceLogout();
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login';
  }
};