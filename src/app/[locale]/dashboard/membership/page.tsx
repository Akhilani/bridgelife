// @ts-nocheck
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { CheckCircle2, Clock, Star, CreditCard, ArrowRight, AlertCircle } from 'lucide-react';
import { formatCNY, formatMinutes } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Membership' };

export default async function MembershipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const supabase = await createClient();
  const { locale } = await params;
  const t = await getTranslations('membership');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  const isActive = !!subscription;
  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : null;

  const minutesLeft = subscription?.errand_minutes_left || 0;
  const minutesTotal = subscription?.errand_minutes_total || 120;
  const minutesPct = Math.round((minutesLeft / minutesTotal) * 100);

  const benefits = [
    'freeProxy',
    'errands',
    'discount',
    'priority',
  ] as const;

  return (
    <div className="p-5 md:p-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
      <p className="text-slate-400 text-sm mb-8">Manage your BridgeLife subscription and errand minutes.</p>

      {isActive ? (
        /* ── ACTIVE MEMBER ── */
        <div className="space-y-5">
          {/* Status Card */}
          <div className="glass-card p-6 border-brand-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/5 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-green-400" />
                </div>
                <span className="font-semibold text-green-400">{t('status.active')}</span>
              </div>

              <h2 className="text-xl font-bold text-white mb-1">{t('plan')}</h2>
              {renewalDate && (
                <p className="text-slate-400 text-sm">
                  {t('renews')} <span className="text-white font-medium">{renewalDate}</span>
                </p>
              )}
            </div>
          </div>

          {/* Errand Minutes */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-brand-400" />
                <h2 className="font-semibold text-white">{t('errands.title')}</h2>
              </div>
              <span className="text-sm text-slate-400">
                {minutesLeft} / {minutesTotal} min
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-surface-600 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-teal-gradient rounded-full transition-all duration-500"
                style={{ width: `${minutesPct}%` }}
              />
            </div>

            <p className="text-slate-400 text-sm">
              <span className="text-white font-semibold">{formatMinutes(minutesLeft)}</span>{' '}
              {t('errands.left')}
            </p>
          </div>

          {/* Benefits */}
          <div className="glass-card p-6">
            <h2 className="font-semibold text-white mb-4">Your Plan Includes</h2>
            <div className="space-y-3">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{t(`benefits.${b}`)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cancel */}
          <div className="glass-card p-5 border-red-500/10">
            <h3 className="font-medium text-white mb-1">{t('cancel.title')}</h3>
            <p className="text-slate-500 text-sm mb-4">{t('cancel.subtitle')}</p>
            <button className="px-4 py-2 text-sm text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-all">
              {t('cancel.confirm')}
            </button>
          </div>
        </div>
      ) : (
        /* ── UPGRADE ── */
        <div className="space-y-6">
          <div className="glass-card p-8 border-brand-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-brand-500/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              {/* Price */}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-slate-400">¥</span>
                <span className="text-6xl font-extrabold gradient-text">299</span>
                <span className="text-slate-400">/month</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{t('upgrade.title')}</h2>
              <p className="text-slate-400 text-sm mb-8">{t('upgrade.subtitle')}</p>

              {/* Benefits */}
              <div className="space-y-3 mb-8">
                {benefits.map((b) => (
                  <div key={b} className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{t(`benefits.${b}`)}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <form action="/api/payments/create-checkout" method="POST">
                <input type="hidden" name="priceId" value={process.env.STRIPE_MEMBERSHIP_PRICE_ID || 'price_placeholder'} />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-4 bg-teal-gradient text-white font-semibold rounded-xl shadow-glow-teal hover:opacity-90 btn-glow transition-all text-base"
                >
                  <CreditCard size={18} />
                  {t('upgrade.cta')}
                </button>
              </form>

              <p className="text-center text-xs text-slate-600 mt-4">
                Secure payment via Stripe · Cancel anytime
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
