import { NextResponse } from 'next/server';
import { getUser, getUsersByCommunity } from '@/lib/firestore';

export async function GET() {
  try {
    const communityId = 'qyyOF1jDVQ0igYSiNiXg';

    // Test 1: Get user by ID
    const userId = 'rg3o5UotWlWtgoSqpvr9';
    const user = await getUser(userId);

    // Test 2: Get all users in community
    const communityUsers = await getUsersByCommunity(communityId);

    return NextResponse.json({
      success: true,
      message: 'Database read tests successful!',
      data: {
        testUser: user,
        totalUsersInCommunity: communityUsers.length,
        communityUsers: communityUsers.map(u => ({
          id: u.id,
          name: u.fullName,
          phone: u.phone,
          role: u.role,
        })),
      },
    });
  } catch (error: any) {
    console.error('Read test error:', error);
    return NextResponse.json({
      success: false,
      message: error.message,
      error: String(error),
    });
  }
}
