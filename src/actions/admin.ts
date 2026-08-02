'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { UserRole, TaskStatus } from '@/lib/types/database';

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .single();

  if ((profile as { role: UserRole } | null)?.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  return { supabase, adminUser: user };
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  try {
    const { supabase } = await checkAdmin();

    const { error } = await (supabase.from('profiles') as any)
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/[locale]/admin', 'layout');
    revalidatePath('/[locale]/admin/users', 'page');

    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to update user role' };
  }
}

export async function assignTaskRunner(taskId: string, runnerId: string | null) {
  try {
    const { supabase } = await checkAdmin();

    const updateData: { runner_id: string | null; status?: TaskStatus } = {
      runner_id: runnerId,
    };

    // If assigned to a runner and task is currently pending, auto-advance to assigned
    if (runnerId) {
      const { data: currentTask } = await (supabase.from('tasks') as any)
        .select('status')
        .eq('id', taskId)
        .single();

      if ((currentTask as { status: TaskStatus } | null)?.status === 'pending') {
        updateData.status = 'assigned';
      }
    }

    const { error } = await (supabase.from('tasks') as any)
      .update(updateData)
      .eq('id', taskId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/[locale]/admin', 'layout');
    revalidatePath('/[locale]/admin/tasks', 'page');
    revalidatePath('/[locale]/ops/queue', 'page');

    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to assign runner' };
  }
}

export async function updateTaskStatusAdmin(taskId: string, status: TaskStatus) {
  try {
    const { supabase } = await checkAdmin();

    const updatePayload: { status: TaskStatus; completed_at?: string | null } = { status };

    if (status === 'completed') {
      updatePayload.completed_at = new Date().toISOString();
    }

    const { error } = await (supabase.from('tasks') as any)
      .update(updatePayload)
      .eq('id', taskId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/[locale]/admin', 'layout');
    revalidatePath('/[locale]/admin/tasks', 'page');
    revalidatePath('/[locale]/ops/queue', 'page');

    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to update task status' };
  }
}

export async function toggleTaskPaid(taskId: string, isPaid: boolean) {
  try {
    const { supabase } = await checkAdmin();

    const { error } = await (supabase.from('tasks') as any)
      .update({ is_paid: isPaid })
      .eq('id', taskId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/[locale]/admin', 'layout');
    revalidatePath('/[locale]/admin/tasks', 'page');

    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to update payment status' };
  }
}
