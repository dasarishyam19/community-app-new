import { auth } from '@/lib/firebase';
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  PhoneAuthCredential,
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';

// Send OTP to phone number
export const sendOTP = async (phoneNumber: string): Promise<ConfirmationResult> => {
  if (!auth) {
    throw new Error('Firebase auth not initialized');
  }

  // Disable app verification for testing (only works with whitelisted numbers)
  if (process.env.NODE_ENV === 'development') {
    auth.settings.appVerificationDisabledForTesting = true;
  }

  // Check if recaptcha container exists
  const container = document.getElementById('recaptcha-container');
  if (!container) {
    throw new Error('reCAPTCHA container not found. Please refresh the page.');
  }

  // Create a Recaptcha verifier
  const recaptchaVerifier = new RecaptchaVerifier(
    auth,
    'recaptcha-container',
    {
      size: 'invisible',
      callback: (response: any) => {
        // reCAPTCHA solved, allow phone verification
        console.log('reCAPTCHA verified');
      },
      'expired-callback': () => {
        // Response expired
        console.log('reCAPTCHA expired');
      },
    },
  );

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

// Verify OTP code
export const verifyOTP = async (confirmationResult: ConfirmationResult, otp: string): Promise<UserCredential> => {
  try {
    const credential = PhoneAuthCredential.credential(confirmationResult.verificationId, otp);
    const userCredential = await auth.signInWithCredential(credential);
    return userCredential;
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Register new user with email and password
export const registerWithEmailPassword = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    if (user) {
      await user.updateProfile({
        displayName: displayName,
      });
    }

    return user;
  } catch (error: any) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmailPassword = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth?.currentUser || null;
};

// Listen to auth state changes
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  if (auth) {
    return auth.onAuthStateChanged(callback);
  }
  return () => {};
};
