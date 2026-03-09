# Control Flow Documentation

## Authentication Flow

### User Registration
1. User enters phone number and personal information
2. WhatsApp OTP is sent via Twilio API
3. OTP is verified through `/api/otp/verify`
4. User data is saved to Firestore via `/api/auth/register`
5. User is redirected to dashboard

### User Login
1. User enters phone number
2. WhatsApp OTP is sent
3. OTP is verified
4. User data is loaded from Firestore
5. User is redirected to `/app` (Instagram-style feed)

### Admin Access
1. User logs in with phone number and OTP
2. System checks `user.role` from Firestore
3. If role is `admin` or `super_admin`, admin panel is accessible
4. Admin can create posts, polls, alerts, and bills

## Application Flow

### Main App Flow (/app)
1. User lands on `/app` after authentication
2. Bottom navigation shows 4 tabs (mobile) or side navigation (desktop):
   - **Feed**: Display community posts
   - **Bills**: Show user's utility bills
   - **Alerts**: Display community alerts
   - **Profile**: User profile and settings

### Theme Management
1. ThemeContext manages light/dark/system modes
2. User preference is stored in localStorage
3. Theme is applied via CSS classes on `document.documentElement`
4. Theme toggle cycles through: light → dark → system

### Data Fetching Flow
1. Component mounts and calls `useAuth()` hook
2. AuthContext fetches user data from Firestore
3. Components fetch specific data based on `userData.communityId`:
   - Feed: `getCommunityPosts(communityId)`
   - Bills: `getUserBills(userId)`
   - Alerts: `getCommunityAlerts(communityId)`

## API Routes Flow

### OTP Flow
1. **Send OTP** (`POST /api/otp/send`)
   - Validate phone number format
   - Generate random 6-digit OTP
   - Store OTP in Redis with 5-minute TTL
   - Send OTP via WhatsApp (Twilio)

2. **Verify OTP** (`POST /api/otp/verify`)
   - Retrieve OTP from Redis
   - Validate OTP and check expiration
   - On success: load user data from Firestore
   - Delete OTP from Redis

### Content Creation Flow (Admin Only)
1. **Create Post** (`POST /api/posts/create`)
   - Validate required fields
   - Check authentication
   - Create post document in Firestore
   - Include author info from authenticated user

2. **Create Poll** (`POST /api/polls/create`)
   - Validate poll data
   - Check authentication
   - Create poll document with options
   - Set default end date (7 days)

3. **Create Alert** (`POST /api/alerts/create`)
   - Validate alert data
   - Check authentication
   - Create alert document
   - Mark as active

4. **Create Bill** (`POST /api/bills/create`)
   - Validate required fields
   - Check authentication
   - Create bill document for specific user
   - Set status to 'pending'

## Error Handling Flow

### Client-Side Errors
1. Try-catch blocks in API calls
2. Display user-friendly error messages
3. Log detailed errors to console

### Server-Side Errors
1. API routes return appropriate HTTP status codes
2. Error responses include:
   - `success: false`
   - `message`: User-friendly error description
   - `error`: Detailed error for debugging (development)

## State Management Flow

### Authentication State (AuthContext)
1. `firebaseUser`: Firebase Auth user object
2. `userData`: Firestore user document with role, community, etc.
3. `loading`: Boolean for auth state
4. `signOut()`: Logout function

### Theme State (ThemeContext)
1. `theme`: Current theme ('light' | 'dark' | 'system')
2. `setTheme()`: Function to update theme

### Component State
- Each component manages its own local state
- Examples: `activeTab`, `showModal`, `posts`, `bills`, etc.

## Navigation Flow

### Route Protection
1. `useAuth()` hook checks authentication status
2. If not authenticated, redirect to `/`
3. If accessing admin routes without permission, redirect to `/dashboard`

### Navigation Patterns
1. **Desktop**: Side navigation with links
2. **Mobile**: Bottom tab navigation
3. **Back buttons**: Return to previous page
4. **Programmatic**: `router.push()` for dynamic navigation

## Data Validation Flow

### Input Validation
1. Client-side validation using Zod schemas
2. Server-side validation in API routes
3. Firebase security rules for data integrity

### Type Safety
1. TypeScript interfaces for all data models
2. Type checking at compile time
3. Runtime validation for user inputs
