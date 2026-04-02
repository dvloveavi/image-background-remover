// POST /api/paypal/create-subscription
// Creates a PayPal billing subscription

import { NextRequest, NextResponse } from 'next/server';
import { createSubscription } from '@/lib/paypal';
import { auth } from '@/auth';

export const runtime = 'edge';

// Subscription plans — Plan IDs must be created in PayPal dashboard (or via API)
// Set these in .env: PAYPAL_PLAN_BASIC_ID, PAYPAL_PLAN_PRO_ID
const SUBSCRIPTION_PLANS: Record<string, { planId: string; credits: number; name: string }> = {
  basic: {
    planId: process.env.PAYPAL_PLAN_BASIC_ID || 'P-39Y09994U2576181GNHHFZBY',
    credits: 25,
    name: 'Basic',
  },
  pro: {
    planId: process.env.PAYPAL_PLAN_PRO_ID || 'P-0D526425ND627542XNHHFZGI',
    credits: 60,
    name: 'Pro',
  },
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planKey } = await req.json();
    const plan = SUBSCRIPTION_PLANS[planKey];

    if (!plan || !plan.planId) {
      return NextResponse.json(
        { error: 'Invalid plan or plan ID not configured' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const subscription = await createSubscription(
      plan.planId,
      `${baseUrl}/payment/success?type=subscription`,
      `${baseUrl}/pricing?cancelled=true`,
      JSON.stringify({ userEmail: session.user.email, planKey, credits: plan.credits })
    );

    const approveUrl = subscription.links?.find(
      (l: { rel: string; href: string }) => l.rel === 'approve'
    )?.href;

    return NextResponse.json({
      subscriptionId: subscription.id,
      approveUrl,
    });
  } catch (error) {
    console.error('[create-subscription]', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}
