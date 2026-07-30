// @ts-nocheck
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Plus, ListTodo, ChevronRight, Filter } from 'lucide-react';
import { CATEGORY_LABELS, STATUS_COLORS, formatCNY, timeAgo } from '@/lib/utils';
import type { Task } from '@/lib/types/database';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Tasks' };

export default async function TasksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const supabase = await createClient();
  const { locale } = await params;
  const { filter } = await searchParams;
  const t = await getTranslations('tasks');
  const tCommon = await getTranslations('common');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('client_id', user!.id)
    .order('created_at', { ascending: false });

  if (filter === 'active') {
    query = query.in('status', ['pending', 'assigned', 'in_progress', 'action_required']);
  } else if (filter === 'completed') {
    query = query.eq('status', 'completed');
  } else if (filter === 'canceled') {
    query = query.eq('status', 'canceled');
  }

  const { data: tasks = [] } = await query;

  const filters = ['all', 'active', 'completed', 'canceled'] as const;

  return (
    <div className="p-5 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">{t('title')}</h1>
          <p className="text-slate-400 text-sm">{t('subtitle')}</p>
        </div>
        <Link
          href="/dashboard/tasks/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-gradient text-white text-sm font-semibold rounded-lg shadow-glow-teal hover:opacity-90 btn-glow transition-all"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">{t('newTask')}</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map((f) => (
          <Link
            key={f}
            href={f === 'all' ? '/dashboard/tasks' : `/dashboard/tasks?filter=${f}` as '/dashboard'}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              (filter || 'all') === f
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                : 'text-slate-400 hover:text-white glass-card'
            }`}
          >
            {t(`filters.${f}`)}
          </Link>
        ))}
      </div>

      {/* Task List */}
      {!tasks || tasks.length === 0 ? (
        <div className="glass-card p-14 text-center">
          <ListTodo size={32} className="text-slate-600 mx-auto mb-4" />
          <p className="text-white font-medium mb-1">{t('empty')}</p>
          <p className="text-slate-500 text-sm mb-6">{t('emptySubtitle')}</p>
          <Link
            href="/dashboard/tasks/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-gradient text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all"
          >
            <Plus size={14} />
            {t('newTask')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task: Task) => (
            <Link
              key={task.id}
              href={`/dashboard/tasks/${task.id}` as '/dashboard'}
              className="glass-card p-4 flex items-center justify-between hover:border-white/15 hover:-translate-y-px transition-all group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                  <ListTodo size={16} className="text-brand-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-slate-500 text-xs">{CATEGORY_LABELS[task.category]}</span>
                    <span className="text-slate-700 text-xs">·</span>
                    <span className="text-slate-500 text-xs">{timeAgo(task.created_at)}</span>
                    {task.price_cny > 0 && (
                      <>
                        <span className="text-slate-700 text-xs">·</span>
                        <span className="text-slate-400 text-xs">{formatCNY(task.price_cny)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <span className={`status-badge hidden sm:inline-flex ${STATUS_COLORS[task.status]}`}>
                  {t(`status.${task.status}`)}
                </span>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
