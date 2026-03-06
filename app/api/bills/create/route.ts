import { NextRequest, NextResponse } from 'next/server';
import { createBill as createBillDB } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';

/**
 * Create a new bill
 * POST /api/bills/create
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userName, type, title, description, amount, currency, dueDate, period, communityId } = body;

    // Validate required fields
    if (!userId || !title || !amount || !dueDate || !communityId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: userId, title, amount, dueDate, communityId',
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

    // Create bill in Firestore
    const billId = await createBillDB({
      communityId,
      userId,
      userName: userName || 'Community Member',
      type,
      category: 'utility',
      title,
      description: description || '',
      amount,
      currency: currency || 'INR',
      dueDate: Timestamp.fromDate(new Date(dueDate)),
      period: period || {
        from: Timestamp.fromDate(new Date()),
        to: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // Default 30 days
      },
      status: 'pending',
      attachments: [],
      createdBy: firebaseUser.uid,
    });

    return NextResponse.json({
      success: true,
      message: 'Bill created successfully',
      billId,
    });
  } catch (error: any) {
    console.error('Create bill error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to create bill',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
