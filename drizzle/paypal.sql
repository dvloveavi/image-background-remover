-- PayPal Integration: Schema additions
-- Run this in Cloudflare Dashboard -> D1 -> Your Database -> Execute SQL

-- 1. Add credits & subscription columns to users table
ALTER TABLE users ADD COLUMN credits INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN preview_credits INTEGER NOT NULL DEFAULT 3;
ALTER TABLE users ADD COLUMN subscription_tier TEXT NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN paypal_subscription_id TEXT;
ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'inactive';

-- 2. Payments table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  paypal_order_id TEXT NOT NULL,
  amount TEXT,
  currency TEXT DEFAULT 'USD',
  type TEXT NOT NULL, -- 'one_time' | 'subscription' | 'subscription_renewal'
  credits INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_paypal_order_id ON payments(paypal_order_id);

-- 3. Usage logs table (if not exists from previous migrations)
CREATE TABLE IF NOT EXISTS usage_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  image_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
