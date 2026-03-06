'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserData, getUserByPhone, updateLastLogin } from '@/lib/firebase/firestore';
import type { User as FirestoreUser } from '@/types/database';

interface AuthContextType {
  // Firebase auth user
  firebaseUser: FirebaseUser | null;
  // Firestore user data (with role, community, etc.)
  userData: FirestoreUser | null;
  loading: boolean;
  sendOTP: (phoneNumber: string) => Promise<{ success: boolean; otp?: string; message?: string }>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<{ success: boolean; message?: string; user?: FirestoreUser }>;
  signOut: () => Promise<void>;
  reloadUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user data from Firestore
  const loadUserData = async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      setUserData(null);
      return;
    }

    try {
      // Try to get user by Firebase UID first
      let user = await getUserData(firebaseUser.uid);

      // If not found, try to find by phone number (if available)
      if (!user && firebaseUser.phoneNumber) {
        user = await getUserByPhone(firebaseUser.phoneNumber);
      }

      if (user) {
        setUserData(user);
      } else {
        console.log('No user data found in Firestore (user might not be registered yet)');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = firebaseOnAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      await loadUserData(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const sendOTPHandler = async (phoneNumber: string) => {
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to send OTP',
      };
    }
  };

  const verifyOTPHandler = async (phoneNumber: string, otp: string) => {
    try {
      // Verify OTP via API
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      const result = await response.json();

      if (!result.success) {
        return result;
      }

      // Load user data from Firestore after successful OTP verification
      // (No need for anonymous auth - just load directly by phone number)
      const user = await getUserByPhone(phoneNumber);

      if (user) {
        setUserData(user);
        // Update last login timestamp
        await updateLastLogin(user.id);
      } else {
        console.log('User not found in Firestore. Please register first.');
        return {
          success: false,
          message: 'User not found. Please register your account first.',
        };
      }

      return {
        success: true,
        message: 'Login successful',
        user,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to verify OTP',
      };
    }
  };

  const signOutHandler = async () => {
    await firebaseSignOut(auth);
    setFirebaseUser(null);
    setUserData(null);
  };

  const reloadUserData = async () => {
    if (firebaseUser) {
      await loadUserData(firebaseUser);
    }
  };

  // For backward compatibility - also expose as "user"
  const value: AuthContextType = {
    firebaseUser,
    userData,
    loading,
    sendOTP: sendOTPHandler,
    verifyOTP: verifyOTPHandler,
    signOut: signOutHandler,
    reloadUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
