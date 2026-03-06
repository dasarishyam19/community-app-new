# #Connect Database Schema - Visual Overview

Visual representation of the #Connect database structure and relationships.

---

## 🗂️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    #Connect Platform                         │
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │    Users     │    │  Communities │    │     Posts    │ │
│  │  (WhatsApp)  │◄──►│   (5KM Geo)  │◄──►│  (By Admins) │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │    Bills     │    │    Polls     │    │    Alerts    │ │
│  │  (Utilities) │    │  (Voting)    │    │  (Emergency) │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                                            │     │
│         ▼                                            ▼     │
│  ┌──────────────┐                            ┌────────────┐│
│  │   Payments   │                            │Notifications│
│  │  (Razorpay)  │                            │  (Push/In-App)│
│  └──────────────┘                            └─────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USERS                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  id (PK)                         │ string  (Auto)                      │
│  phoneNumber                     │ string  (+91XXXXXXXXXX)              │
│  fullName                        │ string                               │
│  role                            │ enum    (user|admin|super_admin)     │
│  communityId (FK)                │ string  ────────┐                   │
│  location                        │ object              │                 │
│  └─ {latitude, longitude}        │                     │                 │
│  isVerified                      │ boolean              │                 │
│  preferences                     │ object              │                 │
│  └─ notifications               │ object              ▼                 │
└─────────────────────────────────────────────────────────────────────────┘
                                                                │
                                                                │ 1:N
                                                                │
                                                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        COMMUNITIES                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  id (PK)                         │ string  (Auto)                      │
│  name                            │ string                               │
│  description                     │ string                               │
│  location                        │ object                               │
│  └─ {center, radius}             │ └─ {latitude, longitude, radius}     │
│  adminId (FK)                    │ string  ────────┐                   │
│  settings                        │ object              │                 │
│  stats                           │ object              │                 │
└─────────────────────────────────────────────────────────────────────────┘
                                                                 │
                                    ┌───────────────────────┼───────────────────────┐
                                    │                       │                       │
                                    │ 1:N                   │ 1:N                   │ 1:N
                                    ▼                       ▼                       ▼
                    ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
                    │       POSTS          │   │       POLLS          │   │      ALERTS         │
├───────────────────┼─────────────────────┼───┼─────────────────────┼───┼─────────────────────┤
│  id (PK)          │ string              │   │ id (PK)             │ string              │   │ id (PK)          │ string              │
│  communityId (FK) │ string              │   │ communityId (FK)    │ string              │   │ communityId (FK) │ string              │
│  authorId (FK)    │ string              │   │ createdBy (FK)      │ string              │   │ senderId (FK)     │ string              │
│  title            │ string              │   │ question            │ string              │   │ type              │ enum                │
│  content          │ string              │   │ options             │ array               │   │ severity          │ enum                │
│  category         │ enum                │   │ status              │ enum                │   │ title             │ string              │
│  status           │ enum                │   │ endsAt              │ Timestamp           │   │ message           │ string              │
│  isPinned         │ boolean             │   │ totalVotes          │ number              │   │ status            │ enum                │
│  stats            │ object              │   └─────────────────────┘   │ endsAt             │ Timestamp           │
│  └─ {views, likes}│                     │                             │ requiresConfirmation│ boolean             │
└───────────────────┴─────────────────────┘                             └─────────────────────┘
                                    │
                                    │
                                    │ 1:N
                                    │
                                    ▼
                    ┌─────────────────────────────────────────────────────────────┐
                    │                        BILLS                                │
├───────────────────┼─────────────────────────────────────────────────────────────┤
│  id (PK)          │ string  (Auto)                                            │
│  userId (FK)      │ string  ────────┐                                         │
│  communityId (FK) │ string              │                                      │
│  type             │ enum                │                                      │
│  title            │ string              │ 1:1                                  │
│  amount           │ number              │                                      │
│  dueDate          │ Timestamp           │                                      │
│  status           │ enum                │                                      │
└───────────────────┴──────────────────────┼──────────────────────────────────────┘
                                          │
                                          ▼
                          ┌───────────────────────────────┐
                          │         PAYMENTS             │
├─────────────────────────┼───────────────────────────────┤
│  id (PK)                │ string  (Auto)               │
│  userId (FK)            │ string                       │
│  billId (FK)            │ string                       │
│  amount                 │ number                       │
│  paymentMethod          │ enum                         │
│  razorpay               │ object                       │
│  └─ {orderId, paymentId}│                             │
│  status                 │ enum                         │
│  completedAt            │ Timestamp                    │
└─────────────────────────┴───────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                      NOTIFICATIONS                          │
├─────────────────────────────────────────────────────────────┤
│  id (PK)          │ string  (Auto)                          │
│  userId (FK)      │ string  ────────┐                       │
│  type             │ enum              │                     │
│  title            │ string            │                     │
│  message          │ string            │                     │
│  status           │ enum              │                     │
│  readAt           │ Timestamp         │                     │
└───────────────────┴────────────────────┼─────────────────────┘
                                           │
                                           │
                                           ▼
                           ┌───────────────────────────────┐
                           │          USER                │
                           │  (Push Notification)         │
                           └───────────────────────────────┘
```

---

## 🔄 Data Flow Examples

### Example 1: Admin Creates Post

```
1. ADMIN (User) logs in via WhatsApp
                  ↓
2. Creates POST in Firestore
                  ↓
3. Stored in: posts/{postId}
                  ↓
4. Notification created for all users in community
                  ↓
5. Users see POST in their feed
```

### Example 2: User Pays Bill

```
1. ADMIN creates BILL for user
                  ↓
2. Stored in: bills/{billId}
                  ↓
3. Notification sent to USER
                  ↓
4. USER clicks "Pay Now"
                  ↓
5. Razorpay payment initiated
                  ↓
6. Payment completed
                  ↓
7. Stored in: payments/{paymentId}
                  ↓
8. BILL status updated to "paid"
                  ↓
9. TRANSACTION recorded
```

### Example 3: Admin Sends Alert

```
1. ADMIN creates ALERT
                  ↓
2. Stored in: alerts/{alertId}
                  ↓
3. System queries all users in community
                  ↓
4. Creates NOTIFICATION for each user
                  ↓
5. Push notifications sent via FCM
                  ↓
6. Users receive ALERT on WhatsApp/Push
```

### Example 4: Community Poll

```
1. ADMIN creates POLL
                  ↓
2. Stored in: polls/{pollId}
                  ↓
3. Users can view and vote
                  ↓
4. Vote stored in: polls/{pollId}/votes/{userId}
                  ↓
5. Poll options updated with vote count
                  ↓
6. Real-time results visible to all
```

---

## 🎯 Role-Based Access Control

```
┌─────────────────────────────────────────────────────────────┐
│                      SUPER_ADMIN                             │
├─────────────────────────────────────────────────────────────┤
│  ✓ Create/Manage Communities                                │
│  ✓ Create/Remove Admins                                     │
│  ✓ View All Payments                                        │
│  ✓ Full Access to All Data                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         ADMIN                                │
├─────────────────────────────────────────────────────────────┤
│  ✓ Create Posts/News                                        │
│  ✓ Create Polls                                             │
│  ✓ Send Alerts                                              │
│  ✓ Create Bills for Users                                   │
│  ✓ View Payments (Own Community)                            │
│  ✓ Manage Community Users                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                          USER                                │
├─────────────────────────────────────────────────────────────┤
│  ✓ View Posts/News                                          │
│  ✓ Vote in Polls                                            │
│  ✓ Receive Alerts                                           │
│  ✓ View Own Bills                                           │
│  ✓ Pay Bills                                                │
│  ✓ View Payment History                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Key Features by Collection

| Collection | Purpose | Admin | User |
|-----------|---------|-------|------|
| **users** | User profiles | ✓ View | ✓ Own |
| **communities** | 5KM areas | ✓ Manage | ✗ |
| **posts** | News/updates | ✓ Create | ✓ View |
| **polls** | Voting | ✓ Create | ✓ Vote |
| **alerts** | Emergency | ✓ Send | ✓ Receive |
| **bills** | Bills | ✓ Create | ✓ View Own |
| **payments** | Transactions | ✓ View All | ✓ View Own |
| **notifications** | Alerts | ✓ Send | ✓ Receive |
| **transactions** | Accounting | ✓ View | ✗ |

---

## 🚀 Next Implementation Steps

### Phase 1: Core Database (Current)
- ✅ Database schema designed
- ✅ TypeScript types created
- ✅ Firestore utilities written
- ⏳ Database setup in Firebase

### Phase 2: Backend API
- ⏳ User creation on registration
- ⏳ Community management APIs
- ⏳ Post CRUD operations
- ⏳ Bill generation APIs
- ⏳ Payment integration (Razorpay)

### Phase 3: Frontend Pages
- ⏳ Admin Dashboard
- ⏳ User Dashboard
- ⏳ Bill Payment Page
- ⏳ Post Creation Interface
- ⏳ Poll Creation & Voting
- ⏳ Alert Management

### Phase 4: Real-time Features
- ⏳ Real-time posts feed
- ⏳ Live poll results
- ⏳ Push notifications
- ⏳ Real-time bill status

---

## 📊 Database Statistics

**Estimated Data Size (per 1000 users):**

- **users**: ~500 KB
- **communities**: ~50 KB
- **posts**: ~5 MB (100 posts)
- **polls**: ~1 MB (20 polls)
- **alerts**: ~500 KB (50 alerts)
- **bills**: ~2 MB (2000 bills)
- **payments**: ~3 MB (2000 payments)
- **notifications**: ~10 MB (10000 notifications)

**Total**: ~21 MB per 1000 users

**Firestore Free Tier**: 1 GB/day reads + 1 GB/month writes ✅

---

## 🔒 Security Notes

1. **Authentication**: WhatsApp OTP (already implemented)
2. **Authorization**: Role-based (user/admin/super_admin)
3. **Validation**: Server-side validation on all inputs
4. **Rate Limiting**: 10 OTPs/hour per phone number
5. **Encryption**: All data encrypted in transit (TLS)

---

**Created by: Shyam Dasari**
**Date: 2026-03-02**
**Version: 1.0**
