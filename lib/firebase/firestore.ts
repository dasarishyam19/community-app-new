import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  setDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import type { User, Community, Post, Bill, Alert } from '@/types/database';
import { limit } from 'firebase/firestore';

/**
 * Save user data to Firestore (called after OTP verification)
 * This creates/updates a user document when they register
 */
export const saveUserData = async (
  userId: string,
  userData: {
    phone: string;
    fullName: string;
    communityId: string;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
  }
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        ...userData,
        role: 'user', // Default role
        isVerified: true, // Verified via WhatsApp OTP
        isActive: true,
        preferences: {
          language: 'en',
          notifications: {
            alerts: true,
            bills: true,
            updates: true,
            polls: true,
          },
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

/**
 * Get user data by ID
 */
export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data(),
      } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

/**
 * Update user's last login timestamp
 */
export const updateLastLogin = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    throw error;
  }
};

/**
 * Check if user phone number exists in database
 */
export const checkUserExists = async (phone: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phone', '==', phone));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
};

/**
 * Get user by phone number
 */
export const getUserByPhone = async (phone: string): Promise<User | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phone', '==', phone));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by phone:', error);
    throw error;
  }
};

/**
 * Get community by ID
 */
export const getCommunityById = async (communityId: string): Promise<Community | null> => {
  try {
    const communityDoc = await getDoc(doc(db, 'communities', communityId));
    if (communityDoc.exists()) {
      return {
        id: communityDoc.id,
        ...communityDoc.data(),
      } as Community;
    }
    return null;
  } catch (error) {
    console.error('Error getting community:', error);
    throw error;
  }
};

/**
 * Get all communities
 */
export const getAllCommunities = async (): Promise<Community[]> => {
  try {
    const communitiesSnapshot = await getDocs(collection(db, 'communities'));
    const communities: Community[] = [];
    communitiesSnapshot.forEach((doc) => {
      communities.push({
        id: doc.id,
        ...doc.data(),
      } as Community);
    });
    return communities;
  } catch (error) {
    console.error('Error getting communities:', error);
    throw error;
  }
};

/**
 * Log login activity (for analytics)
 */
export const logLoginActivity = async (userId: string, phone: string): Promise<void> => {
  try {
    await addDoc(collection(db, 'loginActivity'), {
      userId,
      phone,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

/**
 * Get community posts
 */
export const getCommunityPosts = async (
  communityId: string,
  maxResults = 20
): Promise<Post[]> => {
  try {
    const q = query(
      collection(db, 'posts'),
      where('communityId', '==', communityId),
      where('status', '==', 'published'),
      orderBy('isPinned', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Post));
  } catch (error) {
    console.error('Error getting community posts:', error);
    return [];
  }
};

/**
 * Get user bills
 */
export const getUserBills = async (userId: string): Promise<Bill[]> => {
  try {
    const q = query(
      collection(db, 'bills'),
      where('userId', '==', userId),
      orderBy('dueDate', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Bill));
  } catch (error) {
    console.error('Error getting user bills:', error);
    return [];
  }
};

/**
 * Get pending bills
 */
export const getPendingBills = async (userId: string): Promise<Bill[]> => {
  try {
    const q = query(
      collection(db, 'bills'),
      where('userId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('dueDate', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Bill));
  } catch (error) {
    console.error('Error getting pending bills:', error);
    return [];
  }
};

/**
 * Get community alerts
 */
export const getCommunityAlerts = async (
  communityId: string,
  maxResults = 50
): Promise<Alert[]> => {
  try {
    const q = query(
      collection(db, 'alerts'),
      where('communityId', '==', communityId),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Alert));
  } catch (error) {
    console.error('Error getting community alerts:', error);
    return [];
  }
};
