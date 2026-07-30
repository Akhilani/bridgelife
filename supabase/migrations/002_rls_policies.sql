-- ============================================================
-- BridgeLife - Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- ============================================================

-- ============================================================
-- HELPER FUNCTION: Get current user role
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES — RLS
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Operators and admins can view all profiles
CREATE POLICY "profiles_select_staff" ON profiles
  FOR SELECT USING (
    current_user_role() IN ('operator', 'admin')
  );

-- Runners can view profiles of their assigned task clients
CREATE POLICY "profiles_select_runner" ON profiles
  FOR SELECT USING (
    current_user_role() = 'runner'
    AND id IN (
      SELECT client_id FROM tasks WHERE runner_id = auth.uid()
    )
  );

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin can update any profile (for role changes)
CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (current_user_role() = 'admin');

-- ============================================================
-- SUBSCRIPTIONS — RLS
-- ============================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Clients view their own subscription
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Operators and admins can view all subscriptions
CREATE POLICY "subscriptions_select_staff" ON subscriptions
  FOR SELECT USING (current_user_role() IN ('operator', 'admin'));

-- Only server-side (service role) can insert/update/delete subscriptions
CREATE POLICY "subscriptions_insert_service" ON subscriptions
  FOR INSERT WITH CHECK (current_user_role() = 'admin');

CREATE POLICY "subscriptions_update_service" ON subscriptions
  FOR UPDATE USING (current_user_role() = 'admin');

-- ============================================================
-- TASKS — RLS
-- ============================================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Clients view only their own tasks
CREATE POLICY "tasks_select_client" ON tasks
  FOR SELECT USING (client_id = auth.uid());

-- Operators can view all tasks
CREATE POLICY "tasks_select_operator" ON tasks
  FOR SELECT USING (current_user_role() IN ('operator', 'admin'));

-- Runners can view tasks assigned to them
CREATE POLICY "tasks_select_runner" ON tasks
  FOR SELECT USING (runner_id = auth.uid());

-- Clients can insert new tasks
CREATE POLICY "tasks_insert_client" ON tasks
  FOR INSERT WITH CHECK (
    client_id = auth.uid()
    AND current_user_role() = 'client'
  );

-- Clients can update their own pending tasks (e.g., cancel)
CREATE POLICY "tasks_update_client" ON tasks
  FOR UPDATE USING (
    client_id = auth.uid()
    AND status IN ('pending')
  );

-- Operators can update all tasks (assign runners, change status)
CREATE POLICY "tasks_update_operator" ON tasks
  FOR UPDATE USING (current_user_role() IN ('operator', 'admin'));

-- Runners can update tasks assigned to them (change status)
CREATE POLICY "tasks_update_runner" ON tasks
  FOR UPDATE USING (
    runner_id = auth.uid()
    AND current_user_role() = 'runner'
  );

-- ============================================================
-- TASK MESSAGES — RLS
-- ============================================================

ALTER TABLE task_messages ENABLE ROW LEVEL SECURITY;

-- Clients can read messages on their own tasks
CREATE POLICY "messages_select_client" ON task_messages
  FOR SELECT USING (
    task_id IN (SELECT id FROM tasks WHERE client_id = auth.uid())
  );

-- Operators and admins can read all messages
CREATE POLICY "messages_select_staff" ON task_messages
  FOR SELECT USING (current_user_role() IN ('operator', 'admin'));

-- Runners can read messages on their assigned tasks
CREATE POLICY "messages_select_runner" ON task_messages
  FOR SELECT USING (
    task_id IN (SELECT id FROM tasks WHERE runner_id = auth.uid())
  );

-- Any authenticated user can send a message on a task they're involved in
CREATE POLICY "messages_insert" ON task_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND (
      task_id IN (SELECT id FROM tasks WHERE client_id = auth.uid())
      OR task_id IN (SELECT id FROM tasks WHERE runner_id = auth.uid())
      OR current_user_role() IN ('operator', 'admin')
    )
  );

-- ============================================================
-- ERRAND SESSIONS — RLS
-- ============================================================

ALTER TABLE errand_sessions ENABLE ROW LEVEL SECURITY;

-- Runners can manage their own sessions
CREATE POLICY "errand_sessions_runner" ON errand_sessions
  FOR ALL USING (runner_id = auth.uid());

-- Operators and admins have full access
CREATE POLICY "errand_sessions_staff" ON errand_sessions
  FOR ALL USING (current_user_role() IN ('operator', 'admin'));

-- Clients can view errand sessions for their tasks
CREATE POLICY "errand_sessions_client" ON errand_sessions
  FOR SELECT USING (
    task_id IN (SELECT id FROM tasks WHERE client_id = auth.uid())
  );
