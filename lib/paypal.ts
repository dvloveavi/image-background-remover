// PayPal API Helper
// Supports both one-time orders and subscriptions (sandbox mode)

const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

// ─── Auth Token ──────────────────────────────────────────────────────────────

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal auth failed: ${err}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return cachedToken.token;
}

// ─── One-time Order ──────────────────────────────────────────────────────────

export interface CreditPackage {
  name: string;
  price: string; // e.g. "4.99"
  credits: number;
  packageId: string; // unique identifier for the package
}

export async function createOrder(pkg: CreditPackage, returnUrl: string, cancelUrl: string) {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: pkg.packageId,
          description: `${pkg.name} - ${pkg.credits} credits`,
          amount: {
            currency_code: 'USD',
            value: pkg.price,
          },
          custom_id: JSON.stringify({ credits: pkg.credits, packageId: pkg.packageId }),
        },
      ],
      application_context: {
        brand_name: 'ImageBackground Remover',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Create order failed: ${err}`);
  }

  return res.json();
}

export async function captureOrder(orderId: string) {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Capture order failed: ${err}`);
  }

  return res.json();
}

export async function getOrder(orderId: string) {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.json();
}

// ─── Subscription ────────────────────────────────────────────────────────────

export interface SubscriptionPlan {
  name: string;
  price: string;
  credits: number;
  planId: string; // PayPal Plan ID (pre-created in dashboard or via API)
}

export async function createSubscription(
  planId: string,
  returnUrl: string,
  cancelUrl: string,
  customId?: string
) {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plan_id: planId,
      custom_id: customId,
      application_context: {
        brand_name: 'ImageBackground Remover',
        user_action: 'SUBSCRIBE_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Create subscription failed: ${err}`);
  }

  return res.json();
}

export async function getSubscription(subscriptionId: string) {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.json();
}

export async function cancelSubscription(subscriptionId: string, reason: string) {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });

  return res.ok;
}

// ─── Create Subscription Plan (one-time setup) ───────────────────────────────

export async function createSubscriptionPlan(opts: {
  productId: string;
  name: string;
  price: string;
  intervalUnit?: 'MONTH' | 'YEAR';
}) {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: opts.productId,
      name: opts.name,
      status: 'ACTIVE',
      billing_cycles: [
        {
          frequency: { interval_unit: opts.intervalUnit || 'MONTH', interval_count: 1 },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0, // 0 = infinite
          pricing_scheme: {
            fixed_price: { value: opts.price, currency_code: 'USD' },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
    }),
  });

  return res.json();
}

// ─── Verify Webhook Signature ─────────────────────────────────────────────────

export async function verifyWebhookSignature(opts: {
  authAlgo: string;
  certUrl: string;
  transmissionId: string;
  transmissionSig: string;
  transmissionTime: string;
  webhookId: string;
  webhookEventBody: string;
}): Promise<boolean> {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: opts.authAlgo,
      cert_url: opts.certUrl,
      transmission_id: opts.transmissionId,
      transmission_sig: opts.transmissionSig,
      transmission_time: opts.transmissionTime,
      webhook_id: opts.webhookId,
      webhook_event: JSON.parse(opts.webhookEventBody),
    }),
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.verification_status === 'SUCCESS';
}
