/**
 * #Connect Database Type Definitions
 *
 * TypeScript types for Firestore collections
 */

import { Timestamp } from 'firebase/firestore';

// ============================================
// USER TYPES
// ============================================

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface UserLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface UserPreferences {
  language: string;
  notifications: {
    alerts: boolean;
    bills: boolean;
    updates: boolean;
    polls: boolean;
  };
}

export interface UserMetadata {
  deviceInfo?: string;
  ipAddress?: string;
}

export interface User {
  id: string;
  phone: string;
  fullName: string;
  email?: string;
  role: UserRole;
  communityId: string;
  location: UserLocation;
  isVerified: boolean;
  isActive: boolean;
  avatar?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  fcmToken?: string;
  preferences: UserPreferences;
  metadata?: UserMetadata;
}

// ============================================
// COMMUNITY TYPES
// ============================================

export interface CommunityLocation {
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in meters
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface CommunityBoundaries {
  type: 'Polygon';
  coordinates: number[][];
}

export interface CommunityStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalPolls: number;
}

export interface CommunitySettings {
  isPublic: boolean;
  requiresApproval: boolean;
  allowGuests: boolean;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  location: CommunityLocation;
  boundaries?: CommunityBoundaries;
  adminId: string;
  stats: CommunityStats;
  settings: CommunitySettings;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Community Admin Subcollection
export type AdminRole = 'primary' | 'secondary' | 'moderator';

export interface AdminPermissions {
  manageUsers: boolean;
  createPosts: boolean;
  createPolls: boolean;
  sendAlerts: boolean;
  manageBills: boolean;
  viewPayments: boolean;
}

export interface CommunityAdmin {
  userId: string;
  role: AdminRole;
  permissions: AdminPermissions;
  assignedAt: Timestamp;
  assignedBy: string;
}

// ============================================
// POST TYPES
// ============================================

export type PostCategory = 'news' | 'announcement' | 'event' | 'maintenance' | 'general';
export type PostPriority = 'low' | 'medium' | 'high' | 'urgent';
export type PostStatus = 'draft' | 'published' | 'archived';
export type PostTargetAudience = 'all' | 'specific' | 'admin_only';

export interface PostMedia {
  images: string[];
  videos: string[];
  documents: string[];
}

export interface PostAttachment {
  type: 'image' | 'video' | 'document';
  url: string;
  name: string;
  size: number;
}

export interface PostStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface Post {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  title: string;
  content: string;
  excerpt: string;
  category: PostCategory;
  priority: PostPriority;
  media: PostMedia;
  attachments: PostAttachment[];
  status: PostStatus;
  isPinned: boolean;
  allowComments: boolean;
  targetAudience: PostTargetAudience;
  targetUsers?: string[];
  scheduledAt?: Timestamp;
  publishedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  stats: PostStats;
}

// Post Comment Subcollection
export interface PostComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  parentId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  likes: number;
}

// ============================================
// POLL TYPES
// ============================================

export type PollStatus = 'draft' | 'active' | 'closed' | 'archived';

export interface PollOption {
  id: string;
  text: string;
  order: number;
  votes: number;
}

export interface PollSettings {
  allowMultiple: boolean;
  isAnonymous: boolean;
  allowAddOptions: boolean;
  endTime: Timestamp;
  minVotes?: number;
}

export interface Poll {
  id: string;
  communityId: string;
  createdBy: string;
  creatorName: string;
  question: string;
  description: string;
  options: PollOption[];
  settings: PollSettings;
  status: PollStatus;
  category: string;
  createdAt: Timestamp;
  endsAt: Timestamp;
  totalVotes: number;
}

// Poll Vote Subcollection
export interface PollVote {
  id: string;
  userId: string;
  optionIds: string[];
  votedAt: Timestamp;
}

// ============================================
// ALERT TYPES
// ============================================

export type AlertType = 'emergency' | 'maintenance' | 'weather' | 'health' | 'general';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'draft' | 'active' | 'expired' | 'cancelled';

export interface AlertDeliveryMethod {
  push: boolean;
  sms: boolean;
  whatsapp: boolean;
  email: boolean;
}

export interface AlertSentStats {
  totalRecipients: number;
  delivered: number;
  failed: number;
  acknowledged: number;
}

export interface Alert {
  id: string;
  communityId: string;
  senderId: string;
  senderName: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  affectedAreas: string[];
  scheduledAt?: Timestamp;
  startsAt: Timestamp;
  endsAt?: Timestamp;
  status: AlertStatus;
  actionUrl?: string;
  requiresConfirmation: boolean;
  deliveryMethod: AlertDeliveryMethod;
  sentStats: AlertSentStats;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// BILL TYPES
// ============================================

export type BillType = 'electricity' | 'garbage' | 'water' | 'property_tax' | 'custom';
export type BillCategory = 'utility' | 'maintenance' | 'fine' | 'other';
export type BillStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'disputed';
export type PaymentMode = 'upi' | 'card' | 'netbanking' | 'wallet' | 'razorpay';

export interface BillPeriod {
  from: Timestamp;
  to: Timestamp;
}

export interface BillDetails {
  units?: number;
  rate?: number;
  previousReading?: number;
  currentReading?: number;
}

export interface BillBreakdown {
  description: string;
  amount: number;
}

export interface Bill {
  id: string;
  communityId: string;
  userId: string;
  userName: string;
  type: BillType;
  category: BillCategory;
  title: string;
  description: string;
  amount: number; // in paise/cents
  currency: string; // "INR"
  dueDate: Timestamp;
  period: BillPeriod;
  status: BillStatus;
  paymentMode?: PaymentMode[];
  billDetails?: BillDetails;
  breakdown?: BillBreakdown[];
  attachments: string[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  paidAt?: Timestamp;
}

// ============================================
// PAYMENT TYPES
// ============================================

export type PaymentType = 'bill_payment' | 'fee' | 'donation' | 'other';
export type PaymentMethod = 'razorpay' | 'stripe' | 'upi' | 'card';
export type PaymentStatus = 'created' | 'pending' | 'completed' | 'failed' | 'refunded';

export interface RazorpayDetails {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface PaymentMetadata {
  ipAddress: string;
  userAgent: string;
  device: string;
}

export interface Payment {
  id: string;
  communityId: string;
  userId: string;
  userName: string;
  billId: string;
  type: PaymentType;
  amount: number; // in paise/cents
  currency: string;
  paymentMethod: PaymentMethod;
  razorpay?: RazorpayDetails;
  status: PaymentStatus;
  transactionId?: string;
  gatewayResponse: any;
  metadata: PaymentMetadata;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  failedAt?: Timestamp;
  refundedAt?: Timestamp;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 'alert' | 'bill' | 'post' | 'poll' | 'payment' | 'system';
export type NotificationStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface NotificationData {
  link?: string;
  entityId?: string;
  entityType?: string;
  action?: string;
}

export interface NotificationChannels {
  push: boolean;
  email: boolean;
  sms: boolean;
  inApp: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData;
  status: NotificationStatus;
  channels: NotificationChannels;
  readAt?: Timestamp;
  deliveredAt?: Timestamp;
  expiresAt?: Timestamp;
  createdAt: Timestamp;
}

// ============================================
// TRANSACTION TYPES
// ============================================

export type TransactionType = 'credit' | 'debit';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';

export interface TransactionParty {
  type: 'user' | 'admin' | 'community';
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  communityId: string;
  type: TransactionType;
  category: string;
  amount: number;
  currency: string;
  from: TransactionParty;
  to: TransactionParty;
  referenceId: string;
  referenceType: string;
  status: TransactionStatus;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  notes?: string;
}

// ============================================
// HELPER TYPES
// ============================================

export type WithId<T> = T & { id: string };

export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateCommunityData = Omit<Community, 'id' | 'createdAt' | 'updatedAt' | 'stats'>;
export type CreatePostData = Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'stats' | 'publishedAt' | 'authorId'>;
export type CreatePollData = Omit<Poll, 'id' | 'createdAt' | 'totalVotes' | 'createdBy'>;
export type CreateAlertData = Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'sentStats'>;
export type CreateBillData = Omit<Bill, 'id' | 'createdAt' | 'updatedAt' | 'paidAt'>;
export type CreatePaymentData = Omit<Payment, 'id' | 'createdAt' | 'completedAt' | 'failedAt' | 'refundedAt'>;
export type CreateNotificationData = Omit<Notification, 'id' | 'createdAt' | 'readAt' | 'deliveredAt'>;

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// FORM TYPES
// ============================================

export interface CreatePostForm {
  title: string;
  content: string;
  category: PostCategory;
  priority: PostPriority;
  targetAudience: PostTargetAudience;
  allowComments: boolean;
  isPinned: boolean;
}

export interface CreatePollForm {
  question: string;
  description: string;
  options: string[];
  allowMultiple: boolean;
  isAnonymous: boolean;
  endsAt: Date;
}

export interface CreateBillForm {
  userId: string;
  type: BillType;
  title: string;
  description: string;
  amount: number;
  dueDate: Date;
  period: {
    from: Date;
    to: Date;
  };
}

export interface CreateAlertForm {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  affectedAreas: string[];
  endsAt?: Date;
  requiresConfirmation: boolean;
}
