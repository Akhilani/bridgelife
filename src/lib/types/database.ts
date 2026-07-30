// ============================================================
// Database Types — Generated from Supabase Schema
// src/lib/types/database.ts
// ============================================================

export type UserRole = 'client' | 'operator' | 'runner' | 'admin';

export type TaskCategory =
  | 'shopping'
  | 'phone_translation'
  | 'document_translation'
  | 'app_navigation'
  | 'visa_support'
  | 'ride_booking'
  | 'house_hunting'
  | 'errands';

export type TaskStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'action_required'
  | 'completed'
  | 'canceled';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  preferred_language: string;
  phone_number: string | null;
  wechat_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing';
  plan_name: string;
  price_cny: number;
  errand_minutes_left: number;
  errand_minutes_total: number;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  client_id: string;
  operator_id: string | null;
  runner_id: string | null;
  category: TaskCategory;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number;
  price_cny: number;
  is_paid: boolean;
  is_member_discount: boolean;
  errand_minutes_used: number;
  location: string | null;
  attachments: string[];
  voice_note_url: string | null;
  completed_at: string | null;
  due_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  client?: Profile;
  runner?: Profile;
  operator?: Profile;
}

export interface TaskMessage {
  id: string;
  task_id: string;
  sender_id: string;
  message: string;
  attachment_url: string | null;
  is_system_message: boolean;
  read_at: string | null;
  created_at: string;
  // Joined
  sender?: Profile;
}

export interface ErrandSession {
  id: string;
  task_id: string;
  runner_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  hourly_rate_cny: number;
  total_charge_cny: number | null;
  notes: string | null;
  created_at: string;
}

// ============================================================
// Database schema type (for Supabase client generics)
// ============================================================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Subscription, 'id' | 'created_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'client' | 'runner' | 'operator'>;
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'client' | 'runner' | 'operator'>>;
      };
      task_messages: {
        Row: TaskMessage;
        Insert: Omit<TaskMessage, 'id' | 'created_at' | 'sender'>;
        Update: Partial<Omit<TaskMessage, 'id' | 'created_at' | 'sender'>>;
      };
      errand_sessions: {
        Row: ErrandSession;
        Insert: Omit<ErrandSession, 'id' | 'created_at'>;
        Update: Partial<Omit<ErrandSession, 'id' | 'created_at'>>;
      };
    };
    Enums: {
      user_role: UserRole;
      task_category: TaskCategory;
      task_status: TaskStatus;
    };
  };
};
