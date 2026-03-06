/**
 * #Connect Firestore Utilities
 *
 * Helper functions for Firestore CRUD operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Query,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  User,
  Community,
  Post,
  Poll,
  Alert,
  Bill,
  Payment,
  Notification,
  Transaction,
  CreateUserData,
  CreateCommunityData,
  CreatePostData,
  CreatePollData,
  CreateAlertData,
  CreateBillData,
  CreatePaymentData,
  CreateNotificationData,
  WithId,
} from '@/types/database';

// ============================================
// COLLECTION NAMES
// ============================================

export const COLLECTIONS = {
  USERS: 'users',
  COMMUNITIES: 'communities',
  POSTS: 'posts',
  POLLS: 'polls',
  ALERTS: 'alerts',
  BILLS: 'bills',
  PAYMENTS: 'payments',
  NOTIFICATIONS: 'notifications',
  TRANSACTIONS: 'transactions',
} as const;

// ============================================
// GENERIC HELPERS
// ============================================

/**
 * Convert Firestore document to typed object with ID
 */
export function docWithId<T>(doc: QueryDocumentSnapshot<DocumentData>): WithId<T> {
  return {
    id: doc.id,
    ...doc.data(),
  } as WithId<T>;
}

/**
 * Create a document with server timestamp
 */
export function withServerTimestamp(data: any): any {
  return {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}

/**
 * Update document with server timestamp
 */
export function withUpdatedTimestamp(data: any): any {
  return {
    ...data,
    updatedAt: Timestamp.now(),
  };
}

// ============================================
// USER OPERATIONS
// ============================================

export const usersCollection = collection(db, COLLECTIONS.USERS);

/**
 * Get user by ID
 */
export async function getUser(userId: string): Promise<WithId<User> | null> {
  const docRef = doc(db, COLLECTIONS.USERS, userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docWithId<User>(docSnap);
  }
  return null;
}

/**
 * Get user by phone number
 */
export async function getUserByPhone(phone: string): Promise<WithId<User> | null> {
  const q = query(usersCollection, where('phone', '==', phone));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return docWithId<User>(querySnapshot.docs[0]);
  }
  return null;
}

/**
 * Create new user
 */
export async function createUser(data: CreateUserData): Promise<string> {
  const docRef = await addDoc(usersCollection, withServerTimestamp(data));
  return docRef.id;
}

/**
 * Update user
 */
export async function updateUser(userId: string, data: Partial<User>): Promise<void> {
  const docRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(docRef, withUpdatedTimestamp(data));
}

/**
 * Get users by community
 */
export async function getUsersByCommunity(
  communityId: string,
  userRole?: string
): Promise<WithId<User>[]> {
  let q: Query<DocumentData> = query(
    usersCollection,
    where('communityId', '==', communityId)
  );

  if (userRole) {
    q = query(q, where('role', '==', userRole));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => docWithId<User>(doc));
}

// ============================================
// COMMUNITY OPERATIONS
// ============================================

export const communitiesCollection = collection(db, COLLECTIONS.COMMUNITIES);

/**
 * Get community by ID
 */
export async function getCommunity(communityId: string): Promise<WithId<Community> | null> {
  const docRef = doc(db, COLLECTIONS.COMMUNITIES, communityId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docWithId<Community>(docSnap);
  }
  return null;
}

/**
 * Get community by ID (alias for compatibility)
 */
export async function getCommunityById(communityId: string): Promise<WithId<Community> | null> {
  return getCommunity(communityId);
}

/**
 * Create community
 */
export async function createCommunity(data: CreateCommunityData): Promise<string> {
  const docRef = await addDoc(communitiesCollection, {
    ...withServerTimestamp(data),
    stats: {
      totalUsers: 0,
      activeUsers: 0,
      totalPosts: 0,
      totalPolls: 0,
    },
  });
  return docRef.id;
}

/**
 * Update community
 */
export async function updateCommunity(
  communityId: string,
  data: Partial<Community>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.COMMUNITIES, communityId);
  await updateDoc(docRef, withUpdatedTimestamp(data));
}

/**
 * Find community by location (within 5km)
 */
export async function findCommunityByLocation(
  latitude: number,
  longitude: number
): Promise<WithId<Community>[]> {
  // Note: This requires a geohash-based solution for production
  // For now, return all communities (client-side filtering)
  const querySnapshot = await getDocs(communitiesCollection);
  return querySnapshot.docs.map((doc) => docWithId<Community>(doc));
}

// ============================================
// POST OPERATIONS
// ============================================

export const postsCollection = collection(db, COLLECTIONS.POSTS);

/**
 * Get posts for community
 */
export async function getCommunityPosts(
  communityId: string,
  maxResults = 20
): Promise<WithId<Post>[]> {
  const q = query(
    postsCollection,
    where('communityId', '==', communityId),
    where('status', '==', 'published'),
    orderBy('isPinned', 'desc'),
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => docWithId<Post>(doc));
}

/**
 * Get post by ID
 */
export async function getPost(postId: string): Promise<WithId<Post> | null> {
  const docRef = doc(db, COLLECTIONS.POSTS, postId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docWithId<Post>(docSnap);
  }
  return null;
}

/**
 * Create post
 */
export async function createPost(data: CreatePostData, authorId: string): Promise<string> {
  const docRef = await addDoc(postsCollection, {
    ...withServerTimestamp(data),
    authorId,
    publishedAt: Timestamp.now(),
    stats: {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
    },
  });
  return docRef.id;
}

/**
 * Update post
 */
export async function updatePost(postId: string, data: Partial<Post>): Promise<void> {
  const docRef = doc(db, COLLECTIONS.POSTS, postId);
  await updateDoc(docRef, withUpdatedTimestamp(data));
}

/**
 * Delete post
 */
export async function deletePost(postId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.POSTS, postId);
  await deleteDoc(docRef);
}

// ============================================
// POLL OPERATIONS
// ============================================

export const pollsCollection = collection(db, COLLECTIONS.POLLS);

/**
 * Get active polls for community
 */
export async function getActivePolls(communityId: string): Promise<WithId<Poll>[]> {
  const q = query(
    pollsCollection,
    where('communityId', '==', communityId),
    where('status', '==', 'active'),
    orderBy('endsAt', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => docWithId<Poll>(doc));
}

/**
 * Get poll by ID
 */
export async function getPoll(pollId: string): Promise<WithId<Poll> | null> {
  const docRef = doc(db, COLLECTIONS.POLLS, pollId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docWithId<Poll>(docSnap);
  }
  return null;
}

/**
 * Create poll
 */
export async function createPoll(data: CreatePollData, createdBy: string): Promise<string> {
  const docRef = await addDoc(pollsCollection, withServerTimestamp(data));
  return docRef.id;
}

/**
 * Vote on poll
 */
export async function voteOnPoll(
  pollId: string,
  userId: string,
  optionIds: string[]
): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const pollRef = doc(db, COLLECTIONS.POLLS, pollId);
    const pollDoc = await transaction.get(pollRef);

    if (!pollDoc.exists()) {
      throw new Error('Poll not found');
    }

    const poll = pollDoc.data() as Poll;
    const voteRef = doc(db, COLLECTIONS.POLLS, pollId, 'votes', userId);
    const voteDoc = await transaction.get(voteRef);

    if (voteDoc.exists()) {
      throw new Error('Already voted');
    }

    // Add vote
    transaction.set(voteRef, {
      userId,
      optionIds,
      votedAt: Timestamp.now(),
    });

    // Update poll stats
    const updatedOptions = poll.options.map((option) => {
      if (optionIds.includes(option.id)) {
        return { ...option, votes: option.votes + 1 };
      }
      return option;
    });

    transaction.update(pollRef, {
      options: updatedOptions,
      totalVotes: poll.totalVotes + 1,
    });
  });
}

// ============================================
// ALERT OPERATIONS
// ============================================

export const alertsCollection = collection(db, COLLECTIONS.ALERTS);

/**
 * Get active alerts for community
 */
export async function getActiveAlerts(communityId: string): Promise<WithId<Alert>[]> {
  const q = query(
    alertsCollection,
    where('communityId', '==', communityId),
    where('isActive', '==', true),
    orderBy('severity', 'desc'),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => docWithId<Alert>(doc));
}

/**
 * Get all alerts for community (both active and inactive)
 */
export async function getCommunityAlerts(
  communityId: string,
  maxResults = 50
): Promise<WithId<Alert>[]> {
  const q = query(
    alertsCollection,
    where('communityId', '==', communityId),
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => docWithId<Alert>(doc));
}

/**
 * Create alert
 */
export async function createAlert(data: CreateAlertData): Promise<string> {
  const docRef = await addDoc(alertsCollection, {
    ...withServerTimestamp(data),
    sentStats: {
      totalRecipients: 0,
      delivered: 0,
      failed: 0,
      acknowledged: 0,
    },
  });
  return docRef.id;
}

/**
 * Update alert
 */
export async function updateAlert(alertId: string, data: Partial<Alert>): Promise<void> {
  const docRef = doc(db, COLLECTIONS.ALERTS, alertId);
  await updateDoc(docRef, withUpdatedTimestamp(data));
}

// ============================================
// BILL OPERATIONS
// ============================================

export const billsCollection = collection(db, COLLECTIONS.BILLS);

/**
 * Get bills for user
 */
export async function getUserBills(userId: string): Promise<WithId<Bill>[]> {
  const q = query(
    billsCollection,
    where('userId', '==', userId),
    orderBy('dueDate', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => docWithId<Bill>(doc));
}

/**
 * Get pending bills for user
 */
export async function getPendingBills(userId: string): Promise<WithId<Bill>[]> {
  const q = query(
    billsCollection,
    where('userId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('dueDate', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => docWithId<Bill>(doc));
}

/**
 * Get overdue bills for community
 */
export async function getOverdueBills(communityId: string): Promise<WithId<Bill>[]> {
  const q = query(
    billsCollection,
    where('communityId', '==', communityId),
    where('status', '==', 'overdue'),
    orderBy('dueDate', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => docWithId<Bill>(doc));
}

/**
 * Create bill
 */
export async function createBill(data: CreateBillData): Promise<string> {
  const docRef = await addDoc(billsCollection, withServerTimestamp(data));
  return docRef.id;
}

/**
 * Update bill status
 */
export async function updateBillStatus(
  billId: string,
  status: Bill['status']
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.BILLS, billId);
  const updateData: Partial<Bill> = { status };

  if (status === 'paid') {
    updateData.paidAt = Timestamp.now();
  }

  await updateDoc(docRef, withUpdatedTimestamp(updateData));
}

// ============================================
// PAYMENT OPERATIONS
// ============================================

export const paymentsCollection = collection(db, COLLECTIONS.PAYMENTS);

/**
 * Get payments for user
 */
export async function getUserPayments(userId: string): Promise<WithId<Payment>[]> {
  const q = query(
    paymentsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => docWithId<Payment>(doc));
}

/**
 * Get payment by ID
 */
export async function getPayment(paymentId: string): Promise<WithId<Payment> | null> {
  const docRef = doc(db, COLLECTIONS.PAYMENTS, paymentId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docWithId<Payment>(docSnap);
  }
  return null;
}

/**
 * Create payment
 */
export async function createPayment(data: CreatePaymentData): Promise<string> {
  const docRef = await addDoc(paymentsCollection, withServerTimestamp(data));
  return docRef.id;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: Payment['status'],
  razorpayDetails?: { paymentId: string; signature: string }
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.PAYMENTS, paymentId);
  const updateData: Partial<Payment> = { status };

  if (razorpayDetails) {
    updateData.razorpay = {
      orderId: '',
      paymentId: razorpayDetails.paymentId,
      signature: razorpayDetails.signature,
    };
  }

  if (status === 'completed') {
    updateData.completedAt = Timestamp.now();
  } else if (status === 'failed') {
    updateData.failedAt = Timestamp.now();
  }

  await updateDoc(docRef, withUpdatedTimestamp(updateData));
}

// ============================================
// NOTIFICATION OPERATIONS
// ============================================

export const notificationsCollection = collection(db, COLLECTIONS.NOTIFICATIONS);

/**
 * Get notifications for user
 */
export async function getUserNotifications(
  userId: string,
  maxResults = 50
): Promise<WithId<Notification>[]> {
  const q = query(
    notificationsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => docWithId<Notification>(doc));
}

/**
 * Get unread notifications for user
 */
export async function getUnreadNotifications(userId: string): Promise<WithId<Notification>[]> {
  const q = query(
    notificationsCollection,
    where('userId', '==', userId),
    where('status', '==', 'sent'),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => docWithId<Notification>(doc));
}

/**
 * Create notification
 */
export async function createNotification(data: CreateNotificationData): Promise<string> {
  const docRef = await addDoc(notificationsCollection, withServerTimestamp(data));
  return docRef.id;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
  await updateDoc(docRef, {
    status: 'read',
    readAt: Timestamp.now(),
  });
}

/**
 * Mark all notifications as read for user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const notifications = await getUnreadNotifications(userId);

  const batch = writeBatch(db);
  notifications.forEach((notification) => {
    const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, notification.id);
    batch.update(docRef, {
      status: 'read',
      readAt: Timestamp.now(),
    });
  });

  await batch.commit();
}

// ============================================
// TRANSACTION OPERATIONS
// ============================================

export const transactionsCollection = collection(db, COLLECTIONS.TRANSACTIONS);

/**
 * Create transaction
 */
export async function createTransaction(data: Omit<Transaction, 'id' | 'createdAt' | 'completedAt'>): Promise<string> {
  const docRef = await addDoc(transactionsCollection, withServerTimestamp(data));
  return docRef.id;
}

/**
 * Get transactions for community
 */
export async function getCommunityTransactions(communityId: string): Promise<WithId<Transaction>[]> {
  const q = query(
    transactionsCollection,
    where('communityId', '==', communityId),
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => docWithId<Transaction>(doc));
}
