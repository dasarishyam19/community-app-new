import { NextRequest, NextResponse } from 'next/server';
import { saveUserData, checkUserExists, getUserByPhone } from '@/lib/firebase/firestore';
import { auth } from '@/lib/firebase';

/**
 * Register user after successful OTP verification
 * POST /api/auth/register
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, fullName, communityId, location } = body;

    // Validate required fields
    if (!phone || !fullName || !communityId || !location) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByPhone(phone);
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User already registered with this phone number',
          user: {
            id: existingUser.id,
            fullName: existingUser.fullName,
            role: existingUser.role,
            communityId: existingUser.communityId,
          },
        },
        { status: 409 }
      );
    }

    // Get current Firebase user (must be authenticated via OTP)
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not authenticated. Please verify OTP first.',
        },
        { status: 401 }
      );
    }

    // Create user in Firestore
    await saveUserData(firebaseUser.uid, {
      phone,
      fullName,
      communityId,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || `${location.latitude}, ${location.longitude}`,
      },
    });

    // Get the created user
    const newUser = await getUserByPhone(phone);

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser?.id,
        fullName: newUser?.fullName,
        phone: newUser?.phone,
        role: newUser?.role,
        communityId: newUser?.communityId,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Registration failed',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
