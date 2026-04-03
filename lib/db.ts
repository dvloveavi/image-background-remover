// D1 Database Helper
// Uses Cloudflare REST API to query D1

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;
const D1_DATABASE_ID = process.env.D1_DATABASE_ID!;

interface D1Result {
  results: Array<{
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    created_at: string;
    last_login: string;
    credits: number;
    preview_credits: number;
    subscription_tier: string;
  }>;
  success: boolean;
  errors: string[];
}

async function d1Query(sql: string, params: (string | null)[] = []): Promise<unknown> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    }
  );

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.errors?.join(', ') || 'D1 query failed');
  }
  return data.result;
}

export async function getUserByEmail(email: string): Promise<D1Result['results'][0] | null> {
  const results = (await d1Query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email])) as D1Result['results'];
  return results.length > 0 ? results[0] : null;
}

export async function upsertUser(user: {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}): Promise<boolean> {
  const existing = await getUserByEmail(user.email);

  if (existing) {
    await d1Query(
      `UPDATE users SET name = ?, image = ?, last_login = datetime('now') WHERE email = ?`,
      [user.name || null, user.image || null, user.email]
    );
  } else {
    await d1Query(
      `INSERT INTO users (id, email, name, image, created_at, last_login) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [user.id, user.email, user.name || null, user.image || null]
    );
  }
  return true;
}

export async function getAllUsers(): Promise<D1Result['results']> {
  return (await d1Query(`SELECT * FROM users ORDER BY created_at DESC`)) as D1Result['results'];
}

export async function getUserCredits(userId: string) {
  const results = (await d1Query(
    `SELECT credits, preview_credits, subscription_tier FROM users WHERE id = ? LIMIT 1`,
    [userId]
  )) as Array<{ credits: number; preview_credits: number; subscription_tier: string }>;
  return results[0] || { credits: 0, preview_credits: 0, subscription_tier: 'free' };
}

export async function deductCredit(userId: string, type: 'hd' | 'preview') {
  const field = type === 'hd' ? 'credits' : 'preview_credits';
  await d1Query(`UPDATE users SET ${field} = ${field} - 1 WHERE id = ?`, [userId]);
  
  // Log usage
  const logId = `${userId}-${Date.now()}`;
  await d1Query(
    `INSERT INTO usage_logs (id, user_id, action, image_type, created_at) VALUES (?, ?, 'remove_background', ?, datetime('now'))`,
    [logId, userId, type]
  );
}

// ─── PayPal / Credits ─────────────────────────────────────────────────────────

export async function addCreditsToUser(email: string, credits: number): Promise<boolean> {
  await d1Query(
    `UPDATE users SET credits = credits + ? WHERE email = ?`,
    [String(credits), email]
  );
  return true;
}

export async function updateUserSubscription(
  email: string,
  opts: { subscriptionId: string; planId: string; status: 'active' | 'cancelled' }
): Promise<boolean> {
  const tier = opts.status === 'active'
    ? (opts.planId === (process.env.PAYPAL_PLAN_PRO_ID || '') ? 'pro' : 'basic')
    : 'free';

  await d1Query(
    `UPDATE users SET subscription_tier = ?, paypal_subscription_id = ?, subscription_status = ? WHERE email = ?`,
    [tier, opts.subscriptionId, opts.status, email]
  );
  return true;
}

export async function recordPayment(opts: {
  userId: string;
  paypalOrderId: string;
  amount?: string;
  currency?: string;
  type: 'one_time' | 'subscription' | 'subscription_renewal';
  credits: number;
  status: string;
}): Promise<boolean> {
  const id = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await d1Query(
    `INSERT INTO payments (id, user_id, paypal_order_id, amount, currency, type, credits, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      id,
      opts.userId,
      opts.paypalOrderId,
      opts.amount || '0',
      opts.currency || 'USD',
      opts.type,
      String(opts.credits),
      opts.status,
    ]
  );
  return true;
}

export async function getUserPayments(email: string) {
  return d1Query(
    `SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
    [email]
  );
}
