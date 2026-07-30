// @ts-nocheck
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';
import TaskDetailClient from './TaskDetailClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Task Details' };

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ locale: string; taskId: string }>;
}) {
  const { locale, taskId } = await params;
  const supabase = await createClient();
  const t = await getTranslations('tasks.detail');

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const [taskResult, profileResult] = await Promise.all([
    supabase
      .from('tasks')
      .select(`*, runner:runner_id(id, full_name, avatar_url), operator:operator_id(id, full_name)`)
      .eq('id', taskId)
      .single(),
    supabase.from('profiles').select('id, full_name, role').eq('id', user.id).single(),
  ]);

  if (!taskResult.data) notFound();

  const task = taskResult.data;
  const profile = profileResult.data;

  // Verify access
  if (task.client_id !== user.id && profile?.role === 'client') {
    redirect(`/${locale}/dashboard/tasks`);
  }

  // Fetch initial messages
  const { data: messages = [] } = await supabase
    .from('task_messages')
    .select(`*, sender:sender_id(id, full_name, role, avatar_url)`)
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  return (
    <div className="p-5 md:p-8 max-w-6xl">
      {/* Back Button */}
      <Link
        href="/dashboard/tasks"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        {t('back')}
      </Link>

      <TaskDetailClient
        task={task as any}
        messages={messages as any}
        currentUserId={user.id}
        currentUserName={profile?.full_name || 'You'}
        currentUserRole={profile?.role || 'client'}
      />
    </div>
  );
}
