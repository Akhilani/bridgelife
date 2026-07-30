-- ============================================================
-- BridgeLife - Seed Data
-- seed.sql
-- ============================================================
-- NOTE: Run AFTER creating users in Supabase Auth dashboard
-- or via the auth API. Profile rows are auto-created by trigger.
-- This seed updates those profiles and adds demo task data.
-- ============================================================

-- Update demo user profiles (replace UUIDs with actual auth user IDs)
-- Demo: client@bridgelife.com | operator@bridgelife.com | runner@bridgelife.com | admin@bridgelife.com

-- For local dev, you can insert directly into auth.users using Supabase CLI

-- Update roles for demo users (update emails to match your test accounts)
UPDATE profiles
SET role = 'operator', full_name = 'Marie Dubois'
WHERE id = (SELECT id FROM auth.users WHERE email = 'operator@bridgelife.com');

UPDATE profiles
SET role = 'runner', full_name = 'Zhang Wei'
WHERE id = (SELECT id FROM auth.users WHERE email = 'runner@bridgelife.com');

UPDATE profiles
SET role = 'admin', full_name = 'Admin User'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@bridgelife.com');

UPDATE profiles
SET full_name = 'Thomas Martin', preferred_language = 'fr'
WHERE id = (SELECT id FROM auth.users WHERE email = 'client@bridgelife.com');

-- Demo subscription for client
INSERT INTO subscriptions (
  user_id,
  status,
  errand_minutes_left,
  errand_minutes_total,
  current_period_start,
  current_period_end
)
SELECT
  id,
  'active',
  85,
  120,
  NOW() - INTERVAL '15 days',
  NOW() + INTERVAL '15 days'
FROM profiles
WHERE id = (SELECT id FROM auth.users WHERE email = 'client@bridgelife.com');

-- Demo tasks
INSERT INTO tasks (client_id, operator_id, runner_id, category, title, description, status, price_cny, is_paid, is_member_discount)
SELECT
  (SELECT id FROM auth.users WHERE email = 'client@bridgelife.com'),
  (SELECT id FROM auth.users WHERE email = 'operator@bridgelife.com'),
  (SELECT id FROM auth.users WHERE email = 'runner@bridgelife.com'),
  'shopping',
  'Proxy Order - Meituan Groceries',
  'Please order the following items from Meituan: milk (2L), eggs (12pcs), bread. Deliver to address on file.',
  'in_progress',
  0.00,
  TRUE,
  TRUE;

INSERT INTO tasks (client_id, category, title, description, status, price_cny, is_paid)
SELECT
  (SELECT id FROM auth.users WHERE email = 'client@bridgelife.com'),
  'document_translation',
  'Apartment Lease Contract Translation',
  'Attached 15-page lease contract needs translation from Chinese to English. Urgent.',
  'pending',
  450.00,
  FALSE;

INSERT INTO tasks (client_id, operator_id, category, title, description, status, price_cny, is_paid, is_member_discount)
SELECT
  (SELECT id FROM auth.users WHERE email = 'client@bridgelife.com'),
  (SELECT id FROM auth.users WHERE email = 'operator@bridgelife.com'),
  'visa_support',
  'Residence Permit Renewal - Standard Package',
  'Need help with annual residence permit renewal. Documents ready.',
  'assigned',
  600.00,
  TRUE,
  FALSE;
