import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { TasksManager } from './TasksManager';
import type { Metadata } from 'next';
import type { Profile, Task } from '@/lib/types/database';

export const metadata: Metadata = { title: 'Task Management — Admin' };

export default async function AdminTasksPage() {
  const supabase = await createClient();
  const t = await getTranslations('admin.tasks');

  // Fetch all tasks with joined client & runner profiles
  const { data: tasks = [] } = await (supabase.from('tasks') as any)
    .select(`
      *,
      client:client_id(full_name, phone_number, wechat_id),
      runner:runner_id(full_name, role)
    `)
    .order('created_at', { ascending: false });

  // Fetch staff profiles (operators and runners) for assignment options
  const { data: staffMembers = [] } = await (supabase.from('profiles') as any)
    .select('*')
    .in('role', ['operator', 'runner', 'admin'])
    .order('full_name', { ascending: true });

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
        <p className="text-slate-400 text-sm mt-1">{t('subtitle')}</p>
      </div>

      <TasksManager
        initialTasks={(tasks || []) as Task[]}
        staffMembers={(staffMembers || []) as Profile[]}
      />
    </div>
  );
}
