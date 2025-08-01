'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { account, databases, appwriteConfig } from '@/lib/appwrite';
import { AuthUser } from '@/types';
import { ID, Query } from 'appwrite';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await account.get();
      if (session) {
        // Get member details from database to check role
        const memberData = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.membersCollectionId,
          [Query.equal('email', session.email)]
        );

        const member = memberData.documents[0];
        if (member) {
          setUser({
            $id: session.$id,
            email: session.email,
            name: session.name,
            role: member.role || 'member',
            memberId: member.$id,
          });
        } else {
          // If no member record found, logout
          await account.deleteSession('current');
          setUser(null);
        }
      }
    } catch (error) {
      console.log('No active session');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Check if there's already an active session
      try {
        const currentSession = await account.get();
        if (currentSession) {
          // If already logged in, just check auth and return
          await checkAuth();
          return;
        }
      } catch (error) {
        // No active session, continue with login
      }

      // Create new session
      await account.createEmailPasswordSession(email, password);
      await checkAuth();
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const newAccount = await account.create(ID.unique(), email, password, name);
      
      // Create member record in database
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.membersCollectionId,
        ID.unique(),
        {
          membershipNumber: `COOP${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`,
          fullName: name,
          email: email,
          phone: '',
          joinDate: new Date().toISOString(),
          status: 'Pending',
          role: email === process.env.ADMIN_EMAIL ? 'admin' : 'member',
        }
      );

      // Don't auto-login after registration
      // User needs to manually login from login page
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Delete all sessions to ensure clean logout
      await account.deleteSessions();
      setUser(null);
    } catch (error) {
      // If deleting all sessions fails, try to delete current session
      try {
        await account.deleteSession('current');
        setUser(null);
      } catch (innerError) {
        // Force logout on client side even if server call fails
        setUser(null);
        console.error('Logout error:', innerError);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}