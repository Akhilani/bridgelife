'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { LayoutDashboard, ListTodo, ShoppingBag, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.home' },
  { href: '/dashboard/tasks', icon: ListTodo, labelKey: 'tasks.title' },
  { href: '/dashboard/services', icon: ShoppingBag, labelKey: 'nav.services' },
  { href: '/dashboard/membership', icon: CreditCard, labelKey: 'membership.title' },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-card rounded-none border-x-0 border-b-0">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all',
                isActive ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <item.icon
                size={20}
                className={isActive ? 'text-brand-400' : 'text-slate-500'}
              />
              <span className="text-xs font-medium truncate max-w-[56px] text-center">
                {t(item.labelKey)}
              </span>
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-brand-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-safe-area-bottom bg-transparent" />
    </nav>
  );
}
