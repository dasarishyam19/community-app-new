import { NextResponse } from 'next/server';
import { createUser } from '@/lib/firestore';
import type { CreateUserData } from '@/types/database';
import { Timestamp } from 'firebase/firestore';

export async function POST() {
  try {
    // Create a test user
    const testUser: CreateUserData = {
      phone: '+919999999999',
      fullName: 'Test User',
      role: 'user',
      communityId: 'qyyOF1jDVQ0igYSiNiXg',
      location: {
        latitude: 17.385044,
        longitude: 78.486671,
        address: 'Test Address, Visakhapatnam',
      },
      isVerified: true,
      isActive: true,
      lastLoginAt: Timestamp.now(),
      preferences: {
        language: 'en',
        notifications: {
          alerts: true,
          bills: true,
          updates: true,
          polls: true,
        },
      },
    };

    const userId = await createUser(testUser);

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully!',
      data: {
        userId,
        user: testUser,
      },
    });
  } catch (error: any) {
    console.error('Write test error:', error);
    return NextResponse.json({
      success: false,
      message: error.message,
      error: String(error),
    });
  }
}
