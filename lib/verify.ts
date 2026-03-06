import { verifyAndDeleteOTP } from './redis';

// Verify OTP from Redis
export async function verifyOTP(phoneNumber: string, otp: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    // Format phone number same way as storage
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    let cleanedPhone = formattedPhone;

    if (cleanedPhone.startsWith('0')) {
      cleanedPhone = '91' + cleanedPhone.substring(1);
    }

    if (!cleanedPhone.startsWith('91') && cleanedPhone.length === 10) {
      cleanedPhone = '91' + cleanedPhone;
    }

    // Verify and delete OTP from Redis
    const isValid = await verifyAndDeleteOTP(cleanedPhone, otp);

    if (isValid) {
      return {
        success: true,
        message: 'OTP verified successfully',
      };
    } else {
      return {
        success: false,
        message: 'Invalid OTP. Please try again.',
      };
    }
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return {
      success: false,
      message: error.message || 'Failed to verify OTP',
    };
  }
}
