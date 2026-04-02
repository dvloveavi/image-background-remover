// POST /api/paypal/webhook
// Handles PayPal webhook events for subscription lifecycle

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, getSubscription } from '@/lib/paypal';
import { addCreditsToUser, updateUserSubscription, recordPayment } from '@/lib/db';

// Credits granted per plan per billing cycle
const PLAN_CREDITS: Record<string, number> = {
  [process.env.PAYPAL_PLAN_BASIC_ID || 'basic']: 25,
  [process.env.PAYPAL_PLAN_PRO_ID || 'pro']: 60,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headers = req.headers;

    // Verify webhook signature (skip in sandbox if WEBHOOK_ID not set)
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (webhookId) {
      const isValid = await verifyWebhookSignature({
        authAlgo: headers.get('paypal-auth-algo') || '',
        certUrl: headers.get('paypal-cert-url') || '',
        transmissionId: headers.get('paypal-transmission-id') || '',
        transmissionSig: headers.get('paypal-transmission-sig') || '',
        transmissionTime: headers.get('paypal-transmission-time') || '',
        webhookId,
        webhookEventBody: body,
      });

      if (!isValid) {
        console.warn('[webhook] Invalid PayPal signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(body);
    console.log('[webhook] Event type:', event.event_type);

    switch (event.event_type) {
      // ─── Subscription activated (first payment succeeded) ──────────────────
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const sub = event.resource;
        const customId = sub.custom_id ? JSON.parse(sub.custom_id) : {};
        const userEmail = customId.userEmail;
        const planId = sub.plan_id;

        if (userEmail) {
          await updateUserSubscription(userEmail, {
            subscriptionId: sub.id,
            planId,
            status: 'active',
          });

          const credits = PLAN_CREDITS[planId] || 0;
          if (credits > 0) {
            await addCreditsToUser(userEmail, credits);
          }

          await recordPayment({
            userId: userEmail,
            paypalOrderId: sub.id,
            amount: sub.billing_info?.last_payment?.amount?.value,
            currency: 'USD',
            type: 'subscription',
            credits,
            status: 'completed',
          });
        }
        break;
      }

      // ─── Monthly renewal payment succeeded ─────────────────────────────────
      case 'PAYMENT.SALE.COMPLETED': {
        const sale = event.resource;
        // For subscription payments, billing_agreement_id = subscription ID
        const subscriptionId = sale.billing_agreement_id;

        if (subscriptionId) {
          const subDetails = await getSubscription(subscriptionId);
          const customId = subDetails.custom_id ? JSON.parse(subDetails.custom_id) : {};
          const userEmail = customId.userEmail;
          const planId = subDetails.plan_id;

          if (userEmail) {
            const credits = PLAN_CREDITS[planId] || 0;
            if (credits > 0) {
              await addCreditsToUser(userEmail, credits);
            }

            await recordPayment({
              userId: userEmail,
              paypalOrderId: sale.id,
              amount: sale.amount?.total,
              currency: sale.amount?.currency,
              type: 'subscription_renewal',
              credits,
              status: 'completed',
            });
          }
        }
        break;
      }

      // ─── Subscription cancelled / expired ──────────────────────────────────
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        const sub = event.resource;
        const customId = sub.custom_id ? JSON.parse(sub.custom_id) : {};
        const userEmail = customId.userEmail;

        if (userEmail) {
          await updateUserSubscription(userEmail, {
            subscriptionId: sub.id,
            planId: sub.plan_id,
            status: 'cancelled',
          });
        }
        break;
      }

      default:
        console.log('[webhook] Unhandled event:', event.event_type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
