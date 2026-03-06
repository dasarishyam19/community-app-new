import { NextRequest, NextResponse } from 'next/server';
import { createPoll as createPollDB } from '@/lib/firestore';
import { auth } from '@/lib/firebase';

/**
 * Create a new poll
 * POST /api/polls/create
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, description, options, settings, communityId } = body;

    // Validate required fields
    if (!question || !options || !communityId || options.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields or insufficient options',
        },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not authenticated. Please log in first.',
        },
        { status: 401 }
      );
    }

    // Create poll in Firestore
    const pollId = await createPollDB({
      question,
      description,
      options,
      settings,
      status: 'active',
      category: 'general',
    }, firebaseUser.uid);

    return NextResponse.json({
      success: true,
      message: 'Poll created successfully',
      pollId,
    });
  } catch (error: any) {
    console.error('Create poll error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to create poll',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
