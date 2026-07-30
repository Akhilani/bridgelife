// @ts-nocheck
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';
import OpsTaskWorkspace from './OpsTaskWorkspace';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Task Workspace' };

export default async function OpsTaskPage({
  params,
}: {
  params: Promise<{ locale: string; taskId: string }>;
}) {
  const { taskId } = await params;
  const supabase = await createClient();

  const [taskResult, messagesResult] = await Promise.all([
    supabase
      .from('tasks')
      .select(`
        *,
        client:client_id(id, full_name, preferred_language, phone_number, wechat_id),
        runner:runner_id(id, full_name),
        errand_sessions(*)
      `)
      .eq('id', taskId)
      .single(),
    supabase
      .from('task_messages')
      .select(`*, sender:sender_id(id, full_name, role, avatar_url)`)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true }),
  ]);

  if (!taskResult.data) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user!.id)
    .single();

  return (
    <div className="p-5 md:p-8">
      <Link
        href="/ops/queue"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Queue
      </Link>

      <OpsTaskWorkspace
        task={taskResult.data as any}
        messages={messagesResult.data || [] as any}
        currentUserId={user!.id}
        currentUserName={currentProfile?.full_name || 'Staff'}
        currentUserRole={currentProfile?.role || 'operator'}
      />
    </div>
  );
}
