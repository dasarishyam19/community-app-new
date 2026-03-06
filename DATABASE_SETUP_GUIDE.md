# #Connect Database Setup Guide

Step-by-step guide to set up your Firebase Firestore database for #Connect.

---

## 📋 Prerequisites Checklist

- [ ] Firebase project created
- [ ] Firebase Auth configured (WhatsApp OTP already working)
- [ ] Firestore database created
- [ ] Have Firebase Admin access

---

## Step 1: Create Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **"Build"** → **"Firestore Database"**
4. Click **"Create database"**
5. Choose location: **"eur3 (europe-west)"** or closest to your users
6. Start in **"Test mode"** for development (30 days)
7. Click **"Create"**

---

## Step 2: Set Up Collections

### Option A: Create Collections Manually (Recommended)

In Firebase Console:

1. Click **"Start collection"**
2. Create these collections one by one:

```
┌────────────────────────────────────┐
│  Collection Name                   │
├────────────────────────────────────┤
│  1. users                          │
│  2. communities                    │
│  3. posts                          │
│  4. polls                          │
│  5. alerts                         │
│  6. bills                          │
│  7. payments                       │
│  8. notifications                  │
│  9. transactions                   │
└────────────────────────────────────┘
```

### Option B: Let Code Create Collections Automatically

Collections will be automatically created when you first add documents. No manual setup needed! ✅

---

## Step 3: Create First Community

Let's create your first community via Firebase Console:

1. Go to **Firestore Database**
2. Click **"Start collection"**
3. Name it: **`communities`**
4. Click **"Add document"** → **"Auto-ID"**
5. Add these fields:

```json
{
  "name": "Hyderabad - Hitech City",
  "description": "Community for Hitech City area residents",
  "location": {
    "center": {
      "latitude": 17.385044,
      "longitude": 78.486671
    },
    "radius": 5000,
    "city": "Hyderabad",
    "state": "Telangana",
    "country": "India",
    "pincode": "500081"
  },
  "adminId": "YOUR_ADMIN_USER_ID",
  "stats": {
    "totalUsers": 0,
    "activeUsers": 0,
    "totalPosts": 0,
    "totalPolls": 0
  },
  "settings": {
    "isPublic": true,
    "requiresApproval": false,
    "allowGuests": false
  },
  "createdAt": {
    "_seconds": 1704067200,
    "_nanoseconds": 0
  },
  "updatedAt": {
    "_seconds": 1704067200,
    "_nanoseconds": 0
  }
}
```

6. Click **"Save"**
7. **Copy the Document ID** - this is your `communityId`

---

## Step 4: Create First Admin User

1. Go to **Authentication** section
2. Find your user (you should have one from WhatsApp OTP testing)
3. **Copy your User ID**

Now create the user document:

1. Go to **Firestore Database**
2. Click **"Start collection"** (or select `users` if exists)
3. Name it: **`users`**
4. Click **"Add document"** → **Auto-ID** (or paste your User ID)
5. Add these fields:

```json
{
  "phoneNumber": "+9182227194",
  "fullName": "Shyam Dasari",
  "role": "super_admin",
  "communityId": "YOUR_COMMUNITY_ID_FROM_STEP_3",
  "location": {
    "latitude": 17.385044,
    "longitude": 78.486671,
    "address": "Hitech City, Hyderabad"
  },
  "isVerified": true,
  "isActive": true,
  "createdAt": {
    "_seconds": 1704067200,
    "_nanoseconds": 0
  },
  "updatedAt": {
    "_seconds": 1704067200,
    "_nanoseconds": 0
  },
  "lastLoginAt": {
    "_seconds": 1704067200,
    "_nanoseconds": 0
  },
  "preferences": {
    "language": "en",
    "notifications": {
      "alerts": true,
      "bills": true,
      "updates": true,
      "polls": true
    }
  }
}
```

6. Click **"Save"**

---

## Step 5: Set Up Security Rules

1. Go to **Firestore Database** → **"Rules"** tab
2. Delete existing rules
3. Copy the rules from `DATABASE_SCHEMA.md` (Security Rules section)
4. Paste them in the editor
5. Click **"Publish"**

⚠️ **For Development**: You can use these test rules first:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // DEV ONLY - allows everything
    }
  }
}
```

⚠️ **Change to production rules** before launching!

---

## Step 6: Set Up Indexes

Indexes are required for complex queries.

### Create Single-Field Indexes (Auto)

Single-field indexes are created automatically. ✅

### Create Composite Indexes (Manual)

1. Go to **Firestore Database** → **"Indexes"** tab
2. Click **"Add index"**
3. Add these indexes:

#### Index 1: Users by Community and Role
```
Collection ID: users
Fields:
  - communityId (Ascending)
  - role (Ascending)
```

#### Index 2: Posts by Community and Created Date
```
Collection ID: posts
Fields:
  - communityId (Ascending)
  - createdAt (Descending)
```

#### Index 3: Posts by Community, Status, and Pinned
```
Collection ID: posts
Fields:
  - communityId (Ascending)
  - status (Ascending)
  - isPinned (Descending)
```

#### Index 4: Bills by User, Status, and Due Date
```
Collection ID: bills
Fields:
  - userId (Ascending)
  - status (Ascending)
  - dueDate (Ascending)
```

#### Index 5: Bills by Community, Status, and Due Date
```
Collection ID: bills
Fields:
  - communityId (Ascending)
  - status (Ascending)
  - dueDate (Ascending)
```

#### Index 6: Polls by Community, Status, and End Date
```
Collection ID: polls
Fields:
  - communityId (Ascending)
  - status (Ascending)
  - endsAt (Ascending)
```

#### Index 7: Notifications by User, Status, and Created Date
```
Collection ID: notifications
Fields:
  - userId (Ascending)
  - status (Ascending)
  - createdAt (Descending)
```

4. Click **"Create"** for each index
5. Wait for indexes to build (takes a few minutes)

---

## Step 7: Test Database Operations

### Test via Firebase Console

1. Go to **Firestore Database**
2. Click on **`users`** collection
3. Click **"Add document"**
4. Add a test user
5. Click **"Save"**
6. ✅ You should see the new user document!

### Test via Code

Create a test script:

```typescript
import { getUser, createUser } from '@/lib/firestore';

// Test creating a user
const testUser = {
  phoneNumber: '+919876543210',
  fullName: 'Test User',
  role: 'user' as const,
  communityId: 'YOUR_COMMUNITY_ID',
  location: {
    latitude: 17.385044,
    longitude: 78.486671,
    address: 'Hyderabad'
  },
  isVerified: true,
  isActive: true,
  preferences: {
    language: 'en',
    notifications: {
      alerts: true,
      bills: true,
      updates: true,
      polls: true
    }
  }
};

const userId = await createUser(testUser);
console.log('User created:', userId);

// Test reading user
const user = await getUser(userId);
console.log('User retrieved:', user);
```

---

## Step 8: Set Up Razorpay (For Payments)

1. Sign up at https://razorpay.com/
2. Go to **Settings** → **API Keys**
3. Copy **Key ID** and **Key Secret**
4. Add to `.env.local`:

```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxx
RAZORPAY_KEY_SECRET=your_secret_here
```

5. Install Razorpay SDK:

```bash
npm install razorpay
```

---

## Step 9: Enable Cloud Storage (For Images/Documents)

1. Go to Firebase Console
2. Click **"Build"** → **"Storage"**
3. Click **"Get started"**
4. Set rules (in test mode):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // DEV ONLY
    }
  }
}
```

---

## Step 10: Verify Setup

### Check Your Setup

- [ ] Firestore Database created
- [ ] At least 1 community created
- [ ] At least 1 admin user created
- [ ] Security rules published
- [ ] Composite indexes created (7 indexes)
- [ ] Test user created successfully
- [ ] Can read/write from code

### Test Database Connection

```bash
# Run this in your project
npm run dev

# Open browser console and test:
curl http://localhost:3000/api/test-db
```

---

## 🎯 Database Structure Overview

```
Firestore Database
│
├── users (User profiles)
│   ├── id (auto)
│   ├── phoneNumber
│   ├── role (user | admin | super_admin)
│   └── communityId
│
├── communities (5KM radius areas)
│   ├── id (auto)
│   ├── name
│   ├── location (center + radius)
│   └── admins (subcollection)
│
├── posts (News by admins)
│   ├── id (auto)
│   ├── communityId
│   ├── authorId (admin)
│   └── content
│
├── polls (Community polls)
│   ├── id (auto)
│   ├── communityId
│   ├── options
│   └── votes (subcollection)
│
├── alerts (Emergency alerts)
│   ├── id (auto)
│   ├── communityId
│   ├── severity
│   └── message
│
├── bills (Utility + custom bills)
│   ├── id (auto)
│   ├── userId
│   ├── type (electricity | garbage | custom)
│   ├── amount
│   └── status
│
├── payments (Razorpay transactions)
│   ├── id (auto)
│   ├── userId
│   ├── billId
│   ├── amount
│   └── status
│
├── notifications (User notifications)
│   ├── id (auto)
│   ├── userId
│   ├── type
│   └── status
│
└── transactions (Accounting)
    ├── id (auto)
    ├── communityId
    ├── type (credit | debit)
    └── amount
```

---

## 📊 Quick Start Data

### Seed Data (Optional)

Want to populate with sample data? Run:

```bash
# This will be created in next steps
npm run seed-database
```

---

## 🔒 Security Best Practices

### Before Launch:

1. ✅ Change security rules from test mode to production
2. ✅ Enable App Check (prevent abuse)
3. ✅ Set up monitoring (Firebase Crashlytics)
4. ✅ Enable billing alerts
5. ✅ Use environment variables for secrets
6. ✅ Never commit `.env.local` to Git

---

## 🐛 Troubleshooting

### "Missing or insufficient permissions"

**Cause:** Security rules blocking access

**Fix:**
1. Check Firestore Rules tab
2. Ensure rules allow read/write for authenticated users
3. For development, use test mode rules (see Step 5)

### "The query requires an index"

**Cause:** Complex query needs composite index

**Fix:**
1. Click the error link in browser console
2. It will take you to create the index automatically
3. Or create manually (see Step 6)

### "Invalid data"

**Cause:** Wrong data type in field

**Fix:**
1. Check field types match schema
2. Use Timestamp for dates
3. Use numbers for amounts (in paise/cents)

---

## 📚 Next Steps

1. ✅ Database setup complete!
2. ➡️ Create API routes for CRUD operations
3. ➡️ Build admin dashboard
4. ➡️ Implement Razorpay payment flow
5. ➡️ Create user dashboard
6. ➡️ Build post/news creation UI
7. ➡️ Implement polling system
8. ➡️ Add alert/notification system

---

## 📞 Support

- Firebase Docs: https://firebase.google.com/docs/firestore
- Firestore Security Rules: https://firebase.google.com/docs/firestore/security/rules-structure
- Index Documentation: https://firebase.google.com/docs/firestore/query-data/indexing

---

**Created by: Shyam Dasari**
**Date: 2026-03-02**
**Version: 1.0**
