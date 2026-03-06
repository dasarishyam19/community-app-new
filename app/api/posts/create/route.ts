import { NextRequest, NextResponse } from 'next/server';
import { createPost as createPostDB } from '@/lib/firestore';
import { auth } from '@/lib/firebase';

/**
 * Create a new post
 * POST /api/posts/create
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, priority, isPinned, communityId } = body;

    // Validate required fields
    if (!title || !content || !communityId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: title, content, communityId',
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

    // Create post in Firestore
    const postId = await createPostDB({
      title,
      content,
      excerpt: content.substring(0, 200) + '...',
      category,
      priority,
      isPinned,
      communityId,
    }, firebaseUser.uid);

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      postId,
    });
  } catch (error: any) {
    console.error('Create post error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to create post',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
