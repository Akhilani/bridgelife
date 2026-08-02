'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Search, UserCheck, Shield, Users, UserX, Check } from 'lucide-react';
import { updateUserRole } from '@/actions/admin';
import { toast } from 'sonner';
import type { Profile, UserRole, Subscription } from '@/lib/types/database';

interface ExtendedProfile extends Profile {
  subscription?: Subscription | null;
}

interface UsersManagerProps {
  initialProfiles: ExtendedProfile[];
}

export function UsersManager({ initialProfiles }: UsersManagerProps) {
  const t = useTranslations('admin.users');
  const [profiles, setProfiles] = useState<ExtendedProfile[]>(initialProfiles);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  const [isPending, startTransition] = useTransition();

  // Statistics
  const totalClients = profiles.filter((p) => p.role === 'client').length;
  const totalStaff = profiles.filter((p) => p.role === 'operator' || p.role === 'runner').length;
  const totalAdmins = profiles.filter((p) => p.role === 'admin').length;
  const totalMembers = profiles.filter((p) => p.subscription?.status === 'active').length;

  // Filtered profiles
  const filteredProfiles = profiles.filter((p) => {
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      p.full_name?.toLowerCase().includes(searchLower) ||
      p.id?.toLowerCase().includes(searchLower) ||
      p.wechat_id?.toLowerCase().includes(searchLower) ||
      p.phone_number?.toLowerCase().includes(searchLower);

    return matchesRole && matchesSearch;
  });

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    startTransition(async () => {
      const res = await updateUserRole(userId, newRole);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(t('roleUpdated'));
        setProfiles((prev) =>
          prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
        );
        setEditingUserId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 border border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center justify-between text-blue-400 mb-1">
            <span className="text-xs font-semibold uppercase">{t('totalClients')}</span>
            <Users size={16} />
          </div>
          <p className="text-2xl font-bold text-white">{totalClients}</p>
        </div>

        <div className="glass-card p-4 border border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center justify-between text-purple-400 mb-1">
            <span className="text-xs font-semibold uppercase">{t('totalStaff')}</span>
            <UserCheck size={16} />
          </div>
          <p className="text-2xl font-bold text-white">{totalStaff}</p>
        </div>

        <div className="glass-card p-4 border border-rose-500/20 bg-rose-500/5">
          <div className="flex items-center justify-between text-rose-400 mb-1">
            <span className="text-xs font-semibold uppercase">{t('totalAdmins')}</span>
            <Shield size={16} />
          </div>
          <p className="text-2xl font-bold text-white">{totalAdmins}</p>
        </div>

        <div className="glass-card p-4 border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-xs font-semibold uppercase">Active Members</span>
            <UserCheck size={16} />
          </div>
          <p className="text-2xl font-bold text-white">{totalMembers}</p>
        </div>
      </div>

      {/* Controls: Search & Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
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

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'client', 'operator', 'runner', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${
                roleFilter === role
                  ? 'bg-brand-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {role === 'all' ? t('allRoles') : role}
            </button>
          ))}
        </div>
      </div>

      {/* User List Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-surface-800/80 text-xs text-slate-400 uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="px-5 py-3">{t('name')}</th>
                <th className="px-5 py-3">{t('role')}</th>
                <th className="px-5 py-3">{t('subscription')}</th>
                <th className="px-5 py-3">{t('wechat')} / {t('phone')}</th>
                <th className="px-5 py-3">{t('joined')}</th>
                <th className="px-5 py-3 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    {t('noUsers')}
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((user) => (
                  <tr key={user.id} className="hover:bg-white/3 transition-colors">
                    {/* User Info */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-300 font-bold text-sm">
                          {(user.full_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.full_name || 'Unnamed User'}</p>
                          <p className="text-xs text-slate-500 font-mono">{user.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="px-5 py-3.5">
                      {editingUserId === user.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                            className="bg-surface-800 border border-white/20 text-white text-xs rounded px-2 py-1 focus:outline-none"
                            disabled={isPending}
                          >
                            <option value="client">Client</option>
                            <option value="operator">Operator</option>
                            <option value="runner">Runner</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleRoleChange(user.id, selectedRole)}
                            disabled={isPending}
                            className="p-1 text-emerald-400 hover:text-emerald-300"
                            title="Save"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            disabled={isPending}
                            className="p-1 text-slate-400 hover:text-white"
                            title="Cancel"
                          >
                            <UserX size={16} />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                            user.role === 'admin'
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : user.role === 'operator'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : user.role === 'runner'
                              ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                              : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          }`}
                        >
                          {user.role}
                        </span>
                      )}
                    </td>

                    {/* Subscription */}
                    <td className="px-5 py-3.5">
                      {user.subscription?.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <Check size={12} />
                          {t('active')}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">{t('noSubscription')}</span>
                      )}
                    </td>

                    {/* WeChat / Phone */}
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      <div>{user.wechat_id ? `WX: ${user.wechat_id}` : '-'}</div>
                      <div>{user.phone_number ? `Tel: ${user.phone_number}` : ''}</div>
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setEditingUserId(user.id);
                          setSelectedRole(user.role);
                        }}
                        className="text-xs text-brand-400 hover:text-brand-300 font-medium hover:underline"
                      >
                        {t('changeRole')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
