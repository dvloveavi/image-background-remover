// POST /api/paypal/capture-order
// Captures (finalizes) a PayPal one-time payment and credits the user

import { NextRequest, NextResponse } from 'next/server';
import { captureOrder, getOrder } from '@/lib/paypal';
import { auth } from '@/auth';
import { addCreditsToUser, recordPayment } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    // Verify order belongs to this user (optional but recommended)
    const orderDetails = await getOrder(orderId);
    if (orderDetails.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Order already captured' }, { status: 400 });
    }

    // Capture the payment
    const capture = await captureOrder(orderId);

    if (capture.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Payment not completed', status: capture.status }, { status: 400 });
    }

    // Extract credits from custom_id
    const purchaseUnit = capture.purchase_units?.[0];
    const customId = purchaseUnit?.payments?.captures?.[0]?.custom_id
      || purchaseUnit?.reference_id;

    let credits = 0;
    try {
      const parsed = JSON.parse(customId || '{}');
      credits = parsed.credits || 0;
    } catch {
      // fallback: try to infer from amount
      const amount = parseFloat(capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || '0');
      if (amount <= 5) credits = 10;
      else if (amount <= 15) credits = 30;
      else credits = 80;
    }

    // Add credits to user
    if (credits > 0) {
      await addCreditsToUser(session.user.email, credits);
    }

    // Record payment in DB
    await recordPayment({
      userId: session.user.email,
      paypalOrderId: orderId,
      amount: capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value,
      currency: 'USD',
      type: 'one_time',
      credits,
      status: 'completed',
    });

    return NextResponse.json({ success: true, credits });
  } catch (error) {
    console.error('[capture-order]', error);
    return NextResponse.json({ error: 'Failed to capture order' }, { status: 500 });
  }
}
