'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Search,
  ListTodo,
  ExternalLink,
  ShoppingBag,
  Languages,
  FileText,
  Navigation,
  Compass,
  Car,
  Home,
  Briefcase,
} from 'lucide-react';
import { assignTaskRunner, updateTaskStatusAdmin, toggleTaskPaid } from '@/actions/admin';
import { toast } from 'sonner';
import { formatCNY } from '@/lib/utils';
import type { Task, TaskCategory, TaskStatus, Profile } from '@/lib/types/database';

interface TasksManagerProps {
  initialTasks: Task[];
  staffMembers: Profile[];
}

const CATEGORY_ICONS: Record<TaskCategory, React.ComponentType<{ size?: number; className?: string }>> = {
  shopping: ShoppingBag,
  phone_translation: Languages,
  document_translation: FileText,
  app_navigation: Navigation,
  visa_support: Compass,
  ride_booking: Car,
  house_hunting: Home,
  errands: Briefcase,
};

export function TasksManager({ initialTasks, staffMembers }: TasksManagerProps) {
  const t = useTranslations('admin.tasks');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isPending, startTransition] = useTransition();

  // Metrics
  const totalTasks = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress' || t.status === 'assigned').length;
  const unassignedCount = tasks.filter((t) => !t.runner_id).length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      t.title?.toLowerCase().includes(searchLower) ||
      (t.client as any)?.full_name?.toLowerCase().includes(searchLower) ||
      (t.runner as any)?.full_name?.toLowerCase().includes(searchLower);

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handleAssignRunner = (taskId: string, runnerId: string) => {
    const val = runnerId === 'unassigned' ? null : runnerId;
    startTransition(async () => {
      const res = await assignTaskRunner(taskId, val);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(t('runnerAssigned'));
        const assignedProfile = staffMembers.find((s) => s.id === val);
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  runner_id: val,
                  runner: assignedProfile || undefined,
                  status: val && t.status === 'pending' ? 'assigned' : t.status,
                }
              : t
          )
        );
      }
    });
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    startTransition(async () => {
      const res = await updateTaskStatusAdmin(taskId, newStatus);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(t('taskUpdated'));
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    });
  };

  const handleTogglePaid = (taskId: string, currentPaid: boolean) => {
    startTransition(async () => {
      const res = await toggleTaskPaid(taskId, !currentPaid);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(t('taskUpdated'));
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, is_paid: !currentPaid } : t))
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-card p-4 border border-blue-500/20 bg-blue-500/5">
          <p className="text-xs text-blue-400 font-semibold uppercase">Total Tasks</p>
          <p className="text-2xl font-bold text-white mt-1">{totalTasks}</p>
        </div>
        <div className="glass-card p-4 border border-amber-500/20 bg-amber-500/5">
          <p className="text-xs text-amber-400 font-semibold uppercase">Pending</p>
          <p className="text-2xl font-bold text-white mt-1">{pendingCount}</p>
        </div>
        <div className="glass-card p-4 border border-purple-500/20 bg-purple-500/5">
          <p className="text-xs text-purple-400 font-semibold uppercase">In Progress</p>
          <p className="text-2xl font-bold text-white mt-1">{inProgressCount}</p>
        </div>
        <div className="glass-card p-4 border border-rose-500/20 bg-rose-500/5">
          <p className="text-xs text-rose-400 font-semibold uppercase">Unassigned</p>
          <p className="text-2xl font-bold text-white mt-1">{unassignedCount}</p>
        </div>
        <div className="glass-card p-4 border border-emerald-500/20 bg-emerald-500/5">
          <p className="text-xs text-emerald-400 font-semibold uppercase">Completed</p>
          <p className="text-2xl font-bold text-white mt-1">{completedCount}</p>
        </div>
      </div>

      {/* Controls: Search & Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="w-full pl-9 pr-4 py-2 bg-surface-800 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 transition-colors"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-800 border border-white/10 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-brand-400"
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="action_required">Action Required</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
          </select>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-surface-800 border border-white/10 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-brand-400"
          >
            <option value="all">{t('allCategories')}</option>
            <option value="shopping">Shopping</option>
            <option value="phone_translation">Phone Translation</option>
            <option value="document_translation">Document Translation</option>
            <option value="app_navigation">App Navigation</option>
            <option value="visa_support">Visa Support</option>
            <option value="ride_booking">Ride Booking</option>
            <option value="house_hunting">House Hunting</option>
            <option value="errands">Errands</option>
          </select>
        </div>
      </div>

      {/* Task Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-surface-800/80 text-xs text-slate-400 uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="px-5 py-3">{t('category')} / Task</th>
                <th className="px-5 py-3">{t('client')}</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">{t('runner')}</th>
                <th className="px-5 py-3">{t('price')}</th>
                <th className="px-5 py-3">{t('created')}</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                    {t('noTasks')}
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const CategoryIcon = CATEGORY_ICONS[task.category] || ListTodo;
                  return (
                    <tr key={task.id} className="hover:bg-white/3 transition-colors">
                      {/* Category & Title */}
                      <td className="px-5 py-3.5 max-w-xs">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-brand-400 shrink-0 mt-0.5">
                            <CategoryIcon size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate">{task.title}</p>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                              {task.category.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="px-5 py-3.5 text-xs">
                        <p className="text-white font-medium">{(task.client as any)?.full_name || 'Unknown'}</p>
                        <p className="text-slate-500 font-mono text-[10px]">
                          {(task.client as any)?.phone_number || ''}
                        </p>
                      </td>

                      {/* Status Selector */}
                      <td className="px-5 py-3.5">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                          disabled={isPending}
                          className={`text-xs rounded-full px-2.5 py-1 font-medium border focus:outline-none cursor-pointer ${
                            task.status === 'completed'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : task.status === 'in_progress'
                              ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                              : task.status === 'assigned'
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              : task.status === 'action_required'
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : task.status === 'canceled'
                              ? 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          <option value="pending" className="bg-surface-800 text-white">Pending</option>
                          <option value="assigned" className="bg-surface-800 text-white">Assigned</option>
                          <option value="in_progress" className="bg-surface-800 text-white">In Progress</option>
                          <option value="action_required" className="bg-surface-800 text-white">Action Required</option>
                          <option value="completed" className="bg-surface-800 text-white">Completed</option>
                          <option value="canceled" className="bg-surface-800 text-white">Canceled</option>
                        </select>
                      </td>

                      {/* Runner Selector */}
                      <td className="px-5 py-3.5">
                        <select
                          value={task.runner_id || 'unassigned'}
                          onChange={(e) => handleAssignRunner(task.id, e.target.value)}
                          disabled={isPending}
                          className="bg-surface-800 border border-white/10 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-brand-400 max-w-[140px] truncate"
                        >
                          <option value="unassigned">{t('unassignedRunner')}</option>
                          {staffMembers.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.full_name} ({s.role})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Price & Paid Status */}
                      <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                        <div className="font-semibold text-white">{formatCNY(task.price_cny)}</div>
                        <button
                          onClick={() => handleTogglePaid(task.id, task.is_paid)}
                          disabled={isPending}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium mt-0.5 border ${
                            task.is_paid
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                          }`}
                        >
                          {task.is_paid ? t('paid') : t('unpaid')}
                        </button>
                      </td>

                      {/* Created */}
                      <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(task.created_at).toLocaleDateString()}
                      </td>

                      {/* Direct Link */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <Link
                          href={`/ops/tasks/${task.id}` as '/dashboard'}
                          className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium hover:underline"
                        >
                          {t('viewWorkspace')}
                          <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
