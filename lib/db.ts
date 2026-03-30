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
  }>;
  success: boolean;
  errors: string[];
}

export async function getUserByEmail(email: string): Promise<D1Result['results'][0] | null> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: `SELECT * FROM users WHERE email = ? LIMIT 1`,
        params: [email],
      }),
    }
  );

  const data = await response.json();
  return data.success && data.result.length > 0 ? data.result[0] : null;
}

export async function upsertUser(user: {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}): Promise<boolean> {
  const existing = await getUserByEmail(user.email);

  const sql = existing
    ? `UPDATE users SET name = ?, image = ?, last_login = datetime('now') WHERE email = ?`
    : `INSERT INTO users (id, email, name, image, created_at, last_login) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`;

  const params = existing
    ? [user.name || null, user.image || null, user.email]
    : [user.id, user.email, user.name || null, user.image || null];

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
  return data.success;
}

export async function getAllUsers(): Promise<D1Result['results']> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: `SELECT * FROM users ORDER BY created_at DESC`,
      }),
    }
  );

  const data = await response.json();
  return data.success ? data.result : [];
}
