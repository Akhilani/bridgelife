import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Zap, MailCheck } from 'lucide-react';
import LoginForm from './LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const t = await getTranslations('auth.login');
  const { registered } = await searchParams;
  const justRegistered = registered === 'true';

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-teal-gradient flex items-center justify-center shadow-glow-teal">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold">
              Bridge<span className="gradient-text">Life</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">{t('title')}</h1>
            <p className="text-slate-400 text-sm">{t('subtitle')}</p>
          </div>

          {/* Registration success notice */}
          {justRegistered && (
            <div className="mb-5 flex items-start gap-3 bg-teal-500/10 border border-teal-500/25 rounded-lg p-3.5">
              <MailCheck size={18} className="text-teal-400 shrink-0 mt-0.5" />
              <p className="text-sm text-teal-300">{t('registrationSuccess')}</p>
            </div>
          )}

          <LoginForm />

          <p className="text-center text-sm text-slate-500 mt-6">
            {t('noAccount')}{' '}
            <Link href="/auth/register" className="text-brand-400 hover:text-brand-300 font-medium">
              {t('register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
