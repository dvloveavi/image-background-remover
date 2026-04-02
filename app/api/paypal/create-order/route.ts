// POST /api/paypal/create-order
// Creates a PayPal one-time payment order for credit packages

import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal';
import { auth } from '@/auth';

export const runtime = 'edge';

// Credit packages config (must match pricing page)
const CREDIT_PACKAGES: Record<string, { name: string; price: string; credits: number }> = {
  starter: { name: 'Starter', price: '4.99', credits: 10 },
  popular: { name: 'Popular', price: '12.99', credits: 30 },
  pro: { name: 'Pro Pack', price: '29.99', credits: 80 },
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packageId } = await req.json();
    const pkg = CREDIT_PACKAGES[packageId];

    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const order = await createOrder(
      { ...pkg, packageId },
      `${baseUrl}/payment/success?type=credits`,
      `${baseUrl}/pricing?cancelled=true`
    );

    // Return the approval URL for redirect
    const approveUrl = order.links?.find((l: { rel: string; href: string }) => l.rel === 'approve')?.href;

    return NextResponse.json({
      orderId: order.id,
      approveUrl,
    });
  } catch (error) {
    console.error('[create-order]', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
