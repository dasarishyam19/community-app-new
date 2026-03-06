import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP as verifyWhatsAppOTP } from '@/lib/verify';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp } = await request.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { success: false, message: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    const result = await verifyWhatsAppOTP(phoneNumber, otp);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Verify OTP API error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
