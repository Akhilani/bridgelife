'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LanguageToggle } from './LanguageToggle';
import { cn } from '@/lib/utils';
import {
  Zap,
  LogOut,
  LayoutDashboard,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Profile } from '@/lib/types/database';

interface NavbarProps {
  user?: Profile | null;
}

export function Navbar({ user }: NavbarProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const portalLink =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'operator' || user?.role === 'runner'
      ? '/ops/queue'
      : '/dashboard';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'navbar-scrolled'
          : 'bg-transparent'
      )}
    >
      <div className="section-container">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-teal-gradient flex items-center justify-center shadow-glow-teal group-hover:scale-110 transition-transform">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Bridge<span className="gradient-text">Life</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {!user && (
              <>
                <NavLink href="/services" active={pathname === '/services'}>
                  {t('services')}
                </NavLink>
                <NavLink href="/#pricing" active={false}>
                  {t('pricing')}
                </NavLink>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={portalLink as '/dashboard'}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  <LayoutDashboard size={15} />
                  {t('dashboard')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={15} />
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-semibold bg-teal-gradient text-white rounded-lg shadow-glow-teal hover:opacity-90 btn-glow transition-all"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-slide-down">
            <div className="glass-card p-4 mt-2 space-y-2">
              <LanguageToggle />
              {user ? (
                <>
                  <Link
                    href={portalLink as '/dashboard'}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard size={15} />
                    {t('dashboard')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg"
                  >
                    <LogOut size={15} />
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block w-full px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 rounded-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block w-full px-3 py-2.5 text-sm font-semibold bg-teal-gradient text-white rounded-lg text-center"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t('register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href as '/'}
      className={cn(
        'px-3 py-2 rounded-lg text-sm font-medium transition-all',
        active
          ? 'text-white bg-white/8'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      )}
    >
      {children}
    </Link>
  );
}
