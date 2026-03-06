import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppOTP } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppOTP(phoneNumber);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Send OTP API error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
