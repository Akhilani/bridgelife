'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import {
  LayoutDashboard,
  ListTodo,
  ShoppingBag,
  CreditCard,
  Settings,
  Zap,
  Kanban,
  Users,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/types/database';

interface SidebarProps {
  role: UserRole;
  userName: string;
}

const CLIENT_NAV = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard.quickActions.viewTasks' },
  { href: '/dashboard/tasks', icon: ListTodo, labelKey: 'tasks.title' },
  { href: '/dashboard/services', icon: ShoppingBag, labelKey: 'nav.services' },
  { href: '/dashboard/membership', icon: CreditCard, labelKey: 'membership.title' },
];

const OPS_NAV = [
  { href: '/ops/queue', icon: Kanban, labelKey: 'ops.queue.title' },
];

const ADMIN_NAV = [
  { href: '/admin', icon: BarChart3, labelKey: 'admin.nav.overview' },
  { href: '/admin/users', icon: Users, labelKey: 'admin.nav.users' },
  { href: '/admin/tasks', icon: ListTodo, labelKey: 'admin.nav.tasks' },
  { href: '/admin/pricing', icon: DollarSign, labelKey: 'admin.nav.pricing' },
];

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();

  const navItems =
    role === 'admin'
      ? ADMIN_NAV
      : role === 'operator' || role === 'runner'
      ? OPS_NAV
      : CLIENT_NAV;

  return (
    <aside className="w-60 min-h-screen glass-card rounded-none border-y-0 border-l-0 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-gradient flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-base">
            Bridge<span className="gradient-text">Life</span>
          </span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 text-sm font-semibold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-slate-500 capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <SidebarLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              active={isActive}
              labelKey={item.labelKey}
            />
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/5">
        <div className="text-xs text-slate-600 text-center">BridgeLife v1.0</div>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  active,
  labelKey,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  active: boolean;
  labelKey: string;
}) {
  const t = useTranslations();

  return (
    <Link
      href={href as '/dashboard'}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
        active
          ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      )}
    >
      <Icon
        size={16}
        className={active ? 'text-brand-400' : 'text-slate-500'}
      />
      {t(labelKey as 'nav.services')}
    </Link>
  );
}
