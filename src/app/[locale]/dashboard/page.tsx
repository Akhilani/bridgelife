// @ts-nocheck
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import {
  Plus, ListTodo, ShoppingBag, CreditCard, Clock,
  ChevronRight, Zap, TrendingUp, Star,
} from 'lucide-react';
import { CATEGORY_LABELS, STATUS_COLORS, formatCNY, timeAgo } from '@/lib/utils';
import type { Task, Subscription } from '@/lib/types/database';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const supabase = await createClient();
  const { locale } = await params;
  const t = await getTranslations('dashboard');
  const tTask = await getTranslations('tasks');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const [profileResult, tasksResult, subResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('tasks')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single(),
  ]);

  const profile = profileResult.data;
  const tasks: Task[] = tasksResult.data || [];
  const subscription: Subscription | null = subResult.data;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t('morning') : hour < 18 ? t('afternoon') : t('evening');

  const activeTasks = tasks.filter((t) =>
    ['pending', 'assigned', 'in_progress', 'action_required'].includes(t.status)
  );
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const quickActions = [
    { href: '/dashboard/tasks/new', icon: Plus, label: t('quickActions.newTask'), accent: true },
    { href: '/dashboard/tasks', icon: ListTodo, label: t('quickActions.viewTasks') },
    { href: '/dashboard/services', icon: ShoppingBag, label: t('quickActions.services') },
    { href: '/dashboard/membership', icon: CreditCard, label: t('quickActions.membership') },
  ];

  return (
    <div className="p-5 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-slate-500 text-sm mb-1">
          {t('greeting')}, {greeting} 👋
        </p>
        <h1 className="text-3xl font-bold text-white">
          {profile?.full_name?.split(' ')[0] || 'there'}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Zap size={18} className="text-brand-400" />}
          label={t('overview.activeTasks')}
          value={activeTasks.length.toString()}
          color="brand"
        />
        <StatCard
          icon={<TrendingUp size={18} className="text-green-400" />}
          label={t('overview.completedTasks')}
          value={completedTasks.length.toString()}
          color="green"
        />
        <StatCard
          icon={<Star size={18} className="text-gold-400" />}
          label={t('overview.memberStatus')}
          value={subscription ? t('overview.active') : t('overview.inactive')}
          color={subscription ? 'gold' : 'slate'}
        />
        <StatCard
          icon={<Clock size={18} className="text-purple-400" />}
          label={t('overview.minutesLeft')}
          value={subscription ? `${subscription.errand_minutes_left}m` : '0m'}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          {t('quickActions.title')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href as '/dashboard'}
              className={`glass-card p-4 flex flex-col items-center gap-3 text-center hover:-translate-y-1 transition-all duration-200 group ${
                action.accent ? 'border-brand-500/30 hover:border-brand-500/50' : 'hover:border-white/15'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  action.accent ? 'bg-teal-gradient shadow-glow-teal' : 'bg-white/5'
                } group-hover:scale-110 transition-transform`}
              >
                <action.icon size={18} className={action.accent ? 'text-white' : 'text-slate-400'} />
              </div>
              <span className={`text-xs font-medium ${action.accent ? 'text-white' : 'text-slate-400'}`}>
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Tasks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            {t('recentTasks.title')}
          </h2>
          <Link
            href="/dashboard/tasks"
            className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            {t('recentTasks.viewAll')} <ChevronRight size={12} />
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <p className="text-slate-500 text-sm">{t('recentTasks.empty')}</p>
            <Link
              href="/dashboard/tasks/new"
              className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-teal-gradient text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all"
            >
              <Plus size={14} />
              {tTask('newTask')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/dashboard/tasks/${task.id}`}
                className="glass-card p-4 flex items-center justify-between hover:border-white/15 hover:-translate-y-px transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <ListTodo size={14} className="text-brand-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{task.title}</p>
                    <p className="text-slate-500 text-xs">
                      {CATEGORY_LABELS[task.category]} · {timeAgo(task.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <span className={`status-badge ${STATUS_COLORS[task.status]}`}>
                    {tTask(`status.${task.status}`)}
                  </span>
                  <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    brand:  'bg-brand-500/10 border-brand-500/20',
    green:  'bg-green-500/10 border-green-500/20',
    gold:   'bg-gold-500/10 border-gold-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20',
    slate:  'bg-white/5 border-white/8',
  };

  return (
    <div className={`glass-card p-4 ${colorMap[color] || colorMap.slate}`}>
      <div className="mb-3">{icon}</div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-slate-500 text-xs">{label}</p>
    </div>
  );
}
