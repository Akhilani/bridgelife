// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import {
  Users,
  ListTodo,
  Star,
  TrendingUp,
  BarChart3,
  ArrowRight,
  ShieldAlert,
  DollarSign,
  Kanban,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { formatCNY } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default async function AdminPage() {
  const supabase = await createClient();
  const t = await getTranslations('admin');

  const [usersResult, tasksResult, membersResult, revenueResult] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('tasks').select('id', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('subscriptions').select('price_cny').eq('status', 'active'),
  ]);

  const totalUsers = usersResult.count || 0;
  const totalTasks = tasksResult.count || 0;
  const activeMembers = membersResult.count || 0;
  const monthlyRevenue = ((revenueResult.data || []) as { price_cny: number }[]).reduce(
    (sum, s) => sum + (s.price_cny || 0),
    0
  );

  // Recent tasks with client & runner details
  const { data: recentTasks = [] } = await supabase
    .from('tasks')
    .select(`*, client:client_id(full_name), runner:runner_id(full_name)`)
    .order('created_at', { ascending: false })
    .limit(8);

  // User role breakdown
  const { data: roleBreakdown = [] } = await supabase
    .from('profiles')
    .select('role');

  const roles = { client: 0, operator: 0, runner: 0, admin: 0 };
  (roleBreakdown || []).forEach((p: { role: string }) => {
    if (roles[p.role as keyof typeof roles] !== undefined) {
      roles[p.role as keyof typeof roles]++;
    }
  });

  // Task status breakdown
  const { data: taskStatusData = [] } = await supabase
    .from('tasks')
    .select('status');

  const taskStatuses = {
    pending: 0,
    assigned: 0,
    in_progress: 0,
    action_required: 0,
    completed: 0,
    canceled: 0,
  };
  (taskStatusData || []).forEach((t: { status: string }) => {
    if (taskStatuses[t.status as keyof typeof taskStatuses] !== undefined) {
      taskStatuses[t.status as keyof typeof taskStatuses]++;
    }
  });

  const stats = [
    {
      icon: Users,
      label: t('overview.totalUsers'),
      value: totalUsers.toLocaleString(),
      href: '/admin/users',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      icon: ListTodo,
      label: t('overview.totalTasks'),
      value: totalTasks.toLocaleString(),
      href: '/admin/tasks',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      icon: Star,
      label: t('overview.activeMembers'),
      value: activeMembers.toLocaleString(),
      href: '/admin/pricing',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      icon: TrendingUp,
      label: t('overview.monthlyRevenue'),
      value: formatCNY(monthlyRevenue),
      href: '/admin/pricing',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('overview.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('overview.subtitle')}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href as '/admin/users'}
            className={`glass-card p-5 border transition-all duration-200 hover:scale-[1.02] group ${s.bg}`}
          >
            <div className="flex items-center justify-between mb-3">
              <s.icon size={22} className={s.color} />
              <ArrowRight
                size={14}
                className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all"
              />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">{s.value}</p>
            <p className="text-slate-400 text-xs mt-1 font-medium">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions Bar */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          {t('overview.quickActions')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/admin/users"
            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-all"
          >
            <Users size={18} className="text-blue-400" />
            <span>{t('overview.viewAllUsers')}</span>
          </Link>

          <Link
            href="/admin/tasks"
            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-all"
          >
            <ListTodo size={18} className="text-purple-400" />
            <span>{t('overview.viewAllTasks')}</span>
          </Link>

          <Link
            href="/admin/pricing"
            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-all"
          >
            <DollarSign size={18} className="text-emerald-400" />
            <span>{t('overview.managePricing')}</span>
          </Link>

          <Link
            href="/ops/queue"
            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-all"
          >
            <Kanban size={18} className="text-amber-400" />
            <span>{t('overview.dispatchQueue')}</span>
          </Link>
        </div>
      </div>

      {/* Task Status Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="glass-card p-3 text-center border border-amber-500/20 bg-amber-500/5">
          <p className="text-xs text-amber-400 font-medium">Pending</p>
          <p className="text-xl font-bold text-white mt-0.5">{taskStatuses.pending}</p>
        </div>
        <div className="glass-card p-3 text-center border border-blue-500/20 bg-blue-500/5">
          <p className="text-xs text-blue-400 font-medium">Assigned</p>
          <p className="text-xl font-bold text-white mt-0.5">{taskStatuses.assigned}</p>
        </div>
        <div className="glass-card p-3 text-center border border-purple-500/20 bg-purple-500/5">
          <p className="text-xs text-purple-400 font-medium">In Progress</p>
          <p className="text-xl font-bold text-white mt-0.5">{taskStatuses.in_progress}</p>
        </div>
        <div className="glass-card p-3 text-center border border-rose-500/20 bg-rose-500/5">
          <p className="text-xs text-rose-400 font-medium">Action Required</p>
          <p className="text-xl font-bold text-white mt-0.5">{taskStatuses.action_required}</p>
        </div>
        <div className="glass-card p-3 text-center border border-emerald-500/20 bg-emerald-500/5">
          <p className="text-xs text-emerald-400 font-medium">Completed</p>
          <p className="text-xl font-bold text-white mt-0.5">{taskStatuses.completed}</p>
        </div>
        <div className="glass-card p-3 text-center border border-slate-500/20 bg-slate-500/5">
          <p className="text-xs text-slate-400 font-medium">Canceled</p>
          <p className="text-xl font-bold text-white mt-0.5">{taskStatuses.canceled}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks Table */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white text-base flex items-center gap-2">
                <Clock size={16} className="text-brand-400" />
                {t('overview.recentTasks')}
              </h2>
              <Link
                href="/admin/tasks"
                className="text-xs font-medium text-brand-400 hover:underline flex items-center gap-1"
              >
                {t('overview.viewAllTasks')}
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentTasks.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">No tasks recorded yet</p>
              ) : (
                recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/3 hover:bg-white/5 border border-white/5 transition-all gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-medium truncate">{task.title}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-600 text-slate-300 font-mono capitalize">
                          {task.category.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Client: <span className="text-slate-200">{(task.client as any)?.full_name || 'Unknown'}</span>
                        {task.runner && (
                          <>
                            {' • '}Runner: <span className="text-brand-300">{(task.runner as any)?.full_name}</span>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          task.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : task.status === 'in_progress'
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                            : task.status === 'assigned'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                            : task.status === 'action_required'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>

                      <Link
                        href={`/ops/tasks/${task.id}` as '/dashboard'}
                        className="text-xs text-slate-400 hover:text-white underline"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Role Breakdown Widget */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-6">
          <div>
            <h2 className="font-semibold text-white text-base mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-brand-400" />
              {t('overview.userBreakdown')}
            </h2>
            <div className="space-y-4">
              {Object.entries(roles).map(([role, count]) => {
                const percentage = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
                return (
                  <div key={role}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-300 capitalize font-medium">{role}s</span>
                      <span className="text-slate-400 text-xs">
                        <strong className="text-white">{count}</strong> ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-surface-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          role === 'admin'
                            ? 'bg-rose-500'
                            : role === 'operator'
                            ? 'bg-amber-500'
                            : role === 'runner'
                            ? 'bg-purple-500'
                            : 'bg-teal-gradient'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-start gap-3">
            <ShieldAlert size={18} className="text-brand-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-brand-300">Admin Control active</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                You have elevated permissions to assign runners, update payment status, and manage platform staff.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
