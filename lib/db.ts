// D1 Database Helper
// Uses Cloudflare REST API to query D1

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY!;
const CLOUDFLARE_API_EMAIL = process.env.CLOUDFLARE_API_EMAIL!;
const D1_DATABASE_ID = process.env.D1_DATABASE_ID!;

interface D1Result {
  results: Array<{
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    created_at: string;
    last_login: string;
  }>;
  success: boolean;
  errors: string[];
}

async function d1Query(sql: string, params: string[] = []): Promise<unknown> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/query`,
    {
      method: 'POST',
      headers: {
        'X-Auth-Key': CLOUDFLARE_API_KEY,
        'X-Auth-Email': CLOUDFLARE_API_EMAIL,
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
