# How to Test Real OTP with Firebase

## Step 1: Enable Phone Authentication in Firebase Console

1. Go to: https://console.firebase.google.com/project/community-hub-3f702/authentication
2. Click **Get Started** (if not already enabled)
3. Click on **Sign-in method** tab
4. Find **Phone** provider and click to enable it
5. Click **Save**

## Step 2: Add Test Phone Numbers (For Development Without SMS Cost)

Firebase allows you to add test phone numbers that work without sending actual SMS:

1. Go to: https://console.firebase.google.com/project/community-hub-3f702/authentication/providers
2. Scroll down to **Phone** provider section
3. Find **Test phone numbers** section
4. Click **Add phone number**
5. Enter:
   - **Phone number**: `+919876543210` (or your actual number)
   - **Code**: `123456` (any 6-digit code)
6. Click **Save**

### Test Multiple Numbers:
- `+919876543210` → Code: `123456`
- `+919876543211` → Code: `654321`

## Step 3: Test the Application

### Option A: Using Test Phone Numbers (Recommended for Development)

1. Open http://localhost:3000
2. Go to **Register** tab
3. Select your community on the map
4. Fill in the form:
   - **Full Name**: `Test User`
   - **Country**: 🇮🇳 India (or your selected country)
   - **Phone**: `9876543210` (without country code)
   - Click **Send OTP**
   - Enter OTP: `123456`
   - Fill remaining fields
5. Click **Create Account**

✅ This will work immediately without SMS cost!

### Option B: Using Real Phone Numbers (Production Mode)

1. Remove test phone numbers from Firebase Console
2. Enter your real phone number in the app
3. Click **Send OTP**
4. Firebase will send a real SMS to your phone
5. Enter the OTP you received

**Note**: Real SMS requires Firebase Blaze plan (pay-as-you-go). Test numbers are free!

## Current Validation Rules

All fields are **mandatory** and have strict validation:

### Login Form:
- ✅ **Phone Number**: 10-15 digits, numbers only
- ✅ **OTP**: Exactly 6 digits, numbers only

### Register Form:
- ✅ **Community**: Must select from map
- ✅ **Full Name**: 2-50 characters
- ✅ **Phone Number**: 10-15 digits, numbers only
- ✅ **OTP**: Exactly 6 digits, numbers only
- ✅ **Apartment Number**: 1-20 characters
- ✅ **Gender**: Must select Male/Female/Other
- ✅ **Owner Name**: 2-50 characters

## Troubleshooting

### "Firebase auth not initialized" Error
- ✅ Ensure `.env.local` file exists with correct credentials
- ✅ Restart the dev server: `npm run dev`

### "reCAPTCHA container not found" Error
- ✅ Refresh the page
- ✅ Check browser console for errors

### OTP Not Sending
- ✅ Ensure Phone provider is enabled in Firebase Console
- ✅ Check if phone number format is correct (with country code)
- ✅ For development, use test phone numbers

### Invalid OTP Error
- ✅ For test numbers, use the exact code you set (e.g., `123456`)
- ✅ For real numbers, wait for SMS and enter the received code
- ✅ OTP is case-sensitive and must be exactly 6 digits

## Firebase Console Quick Links

- **Authentication**: https://console.firebase.google.com/project/community-hub-3f702/authentication
- **Firestore Database**: https://console.firebase.google.com/project/community-hub-3f702/firestore
- **Project Settings**: https://console.firebase.google.com/project/community-hub-3f702/settings/general

## Success Indicators

When everything is working correctly:

1. ✅ **Send OTP** button shows loading spinner
2. ✅ Green checkmark appears with "Sent!" or "Verified!" text
3. ✅ OTP input becomes enabled
4. ✅ Submit button becomes enabled after filling OTP
5. ✅ Success message appears after verification
6. ✅ User is redirected to dashboard
7. ✅ User data appears in Firestore Database

---

**Ready to test! Open http://localhost:3000 and try registering!** 🚀
