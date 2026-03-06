import { NextResponse } from 'next/server';
import { getCommunity } from '@/lib/firestore';

export async function GET() {
  try {
    // Test reading your community
    const communityId = 'qyyOF1jDVQ0igYSiNiXg';
    const community = await getCommunity(communityId);

    if (!community) {
      return NextResponse.json({
        success: false,
        message: 'Community not found',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      data: {
        communityId: community.id,
        name: community.name,
        description: community.description,
        location: community.location,
        stats: community.stats,
      },
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      message: error.message,
      error: String(error),
    });
  }
}
