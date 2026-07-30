// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { Users, ListTodo, Star, TrendingUp, BarChart3 } from 'lucide-react';
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
  const monthlyRevenue = ((revenueResult.data || []) as { price_cny: number }[]).reduce((sum, s) => sum + (s.price_cny || 0), 0);

  // Recent tasks
  const { data: recentTasks = [] } = await supabase
    .from('tasks')
    .select(`*, client:client_id(full_name)`)
    .order('created_at', { ascending: false })
    .limit(10);

  // User role breakdown
  const { data: roleBreakdown = [] } = await supabase
    .from('profiles')
    .select('role');

  const roles = { client: 0, operator: 0, runner: 0, admin: 0 };
  (roleBreakdown || []).forEach((p: { role: string }) => { roles[p.role as keyof typeof roles]++; });

  const stats = [
    { icon: Users,     label: t('overview.totalUsers'),    value: totalUsers.toLocaleString(),    color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
    { icon: ListTodo,  label: t('overview.totalTasks'),    value: totalTasks.toLocaleString(),    color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { icon: Star,      label: t('overview.activeMembers'), value: activeMembers.toLocaleString(), color: 'text-gold-400',   bg: 'bg-gold-500/10 border-gold-500/20' },
    { icon: TrendingUp, label: t('overview.monthlyRevenue'), value: formatCNY(monthlyRevenue),   color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
  ];

  return (
    <div className="p-5 md:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
        <p className="text-slate-400 text-sm mt-1">Platform overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className={`glass-card p-5 border ${s.bg}`}>
            <s.icon size={20} className={`${s.color} mb-3`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="font-semibold text-white mb-4">Recent Tasks</h2>
          <div className="space-y-2">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/3 transition-colors">
                <div className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm truncate">{task.title}</p>
                  <p className="text-slate-500 text-xs">{(task.client as any)?.full_name || 'Unknown'}</p>
                </div>
                <span className="text-xs text-slate-600 flex-shrink-0">{task.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Role Breakdown */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={15} className="text-brand-400" />
            User Breakdown
          </h2>
          <div className="space-y-3">
            {Object.entries(roles).map(([role, count]) => (
              <div key={role}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400 capitalize">{role}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
                <div className="h-1.5 bg-surface-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-gradient rounded-full"
                    style={{ width: `${totalUsers > 0 ? (count / totalUsers) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
