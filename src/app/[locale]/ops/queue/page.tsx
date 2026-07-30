// @ts-nocheck
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import KanbanBoard from './KanbanBoard';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dispatch Queue' };

export default async function QueuePage() {
  const supabase = await createClient();
  const t = await getTranslations('ops.queue');

  // Fetch runners for assignment
  const { data: runners = [] } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'runner');

  // Fetch all non-canceled/non-completed tasks with client info
  const { data: tasks = [] } = await supabase
    .from('tasks')
    .select(`
      *,
      client:client_id(id, full_name, preferred_language),
      runner:runner_id(id, full_name)
    `)
    .not('status', 'in', '("canceled","completed")')
    .order('created_at', { ascending: false });

  return (
    <div className="p-5 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
        <p className="text-slate-400 text-sm mt-1">{t('subtitle')}</p>
      </div>
      <KanbanBoard tasks={tasks as any} runners={runners as any} />
    </div>
  );
}
