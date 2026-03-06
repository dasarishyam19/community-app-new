import { NextRequest, NextResponse } from 'next/server';
import { createAlert as createAlertDB } from '@/lib/firestore';
import { auth } from '@/lib/firebase';

/**
 * Create a new alert
 * POST /api/alerts/create
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, message, type, severity, affectedAreas, startsAt, endsAt, requiresConfirmation, communityId } = body;

    // Validate required fields
    if (!title || !message || !communityId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: title, message, communityId',
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

    // Create alert in Firestore
    const alertId = await createAlertDB({
      communityId,
      senderId: firebaseUser.uid,
      senderName: 'Admin', // TODO: Get from user data
      title,
      message,
      type,
      severity,
      affectedAreas: affectedAreas || [],
      startsAt: startsAt || new Date().toISOString(),
      endsAt,
      status: 'active',
      requiresConfirmation: requiresConfirmation || false,
      deliveryMethod: {
        push: true,
        sms: false,
        whatsapp: true,
        email: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Alert sent successfully',
      alertId,
    });
  } catch (error: any) {
    console.error('Create alert error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to create alert',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
