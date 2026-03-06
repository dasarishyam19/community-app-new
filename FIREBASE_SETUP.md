# Firebase Setup Guide

This guide will help you set up Firebase for the #Connect application.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click on "Add project" or "Create a project"
3. Enter your project name (e.g., "community-hub")
4. Follow the setup prompts (you can disable Google Analytics for this project)

## Step 2: Enable Authentication

1. In the Firebase Console, go to **Build** > **Authentication**
2. Click **Get Started**
3. Select **Phone** provider
4. Enable Phone provider
5. Click **Save**

### Important: Configure Phone Auth Settings

- For development/testing, you may need to add your phone number as a test user
- Go to Authentication > Phone > Test phones
- Add your phone number and a test code (e.g., `123456`)

## Step 3: Create Firestore Database

1. In the Firebase Console, go to **Build** > **Firestore Database**
2. Click **Create database**
3. Choose your location (select closest to your users)
4. Start in **Test mode** (we'll update security rules later)
5. Click **Enable**

## Step 4: Get Firebase Configuration

1. In the Firebase Console, click the **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the **</>** icon (web app)
4. Register your app (name it "community-hub-web")
5. Copy the `firebaseConfig` object
6. You don't need to install Firebase SDK via CDN - we've already installed it via npm

## Step 5: Set Up Environment Variables

1. Copy the `.env.local.example` file to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. Replace the placeholder values with your actual Firebase config values from Step 4

## Step 6: Set Up Firestore Security Rules

Go to Firestore Database > Rules and update the rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Communities collection (public read, authenticated write)
    match /communities/{communityId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Login activity (users can only write their own logs)
    match /loginActivity/{logId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## Step 7: Set Up Initial Communities (Optional)

Create a few communities in your Firestore database:

1. Go to **Firestore Database** > **Data**
2. Click **Start collection**
3. Collection ID: `communities`
4. Add documents with these fields:

```javascript
// Document ID: "1"
{
  id: 1,
  name: "Prestige Lakeside",
  city: "Bangalore",
  lat: 12.9716,
  lng: 77.5946,
  units: 250
}

// Document ID: "2"
{
  id: 2,
  name: "Godrej Infinity",
  city: "Mumbai",
  lat: 19.0760,
  lng: 72.8777,
  units: 300
}

// Document ID: "3"
{
  id: 3,
  name: "DLF The Camellias",
  city: "Delhi",
  lat: 28.6139,
  lng: 77.2090,
  units: 400
}

// Document ID: "4"
{
  id: 4,
  name: "Brigade Exotica",
  city: "Hyderabad",
  lat: 17.3850,
  lng: 78.4867,
  units: 200
}

// Document ID: "5"
{
  id: 5,
  name: "Puravankara Projects",
  city: "Chennai",
  lat: 13.0827,
  lng: 80.2707,
  units: 180
}
```

## Step 8: Restart Development Server

After setting up the environment variables, restart your development server:

```bash
npm run dev
```

## Troubleshooting

### Phone Auth Not Working
- Make sure Phone provider is enabled in Firebase Console
- For development, add test phone numbers in Authentication > Phone > Test phones
- Check browser console for specific Firebase errors

### Firestore Permission Errors
- Verify Firestore Security Rules are set correctly
- Check that your database is not in production mode with restrictive rules

### reCAPTCHA Issues
- The invisible reCAPTCHA container is already included in `app/layout.tsx`
- Make sure you have valid Firebase configuration

### CORS Issues
- If you encounter CORS errors, you may need to authorized your domain in Firebase Console
- Go to Authentication > Settings > Authorized domains

## Testing

Once setup is complete, you should be able to:
1. Send OTP to phone numbers
2. Verify OTP and login
3. Register new users with phone verification
4. Save user data to Firestore
5. View user data after login

## Next Steps

After completing Firebase setup, the application will use real Firebase authentication instead of the simulated authentication currently in place.
