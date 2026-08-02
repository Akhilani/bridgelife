'use client';

import { useTranslations } from 'next-intl';
import { CreditCard, DollarSign, Clock, Tag, Star, CheckCircle } from 'lucide-react';
import { formatCNY } from '@/lib/utils';
import type { Subscription, Profile } from '@/lib/types/database';

interface ExtendedSubscription extends Subscription {
  user?: Profile | null;
}

interface PricingManagerProps {
  subscriptions: ExtendedSubscription[];
}

export function PricingManager({ subscriptions }: PricingManagerProps) {
  const t = useTranslations('admin.pricing');

  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const totalMRR = activeSubs.reduce((acc, curr) => acc + (curr.price_cny || 0), 0);
  const totalErrandMinutesAllocated = activeSubs.reduce(
    (acc, curr) => acc + (curr.errand_minutes_total || 120),
    0
  );

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold uppercase">{t('activeSubscriptions')}</span>
            <Star size={18} />
          </div>
          <p className="text-3xl font-bold text-white">{activeSubs.length}</p>
          <p className="text-xs text-slate-400 mt-1">
            MRR: <strong className="text-emerald-400">{formatCNY(totalMRR)}</strong>
          </p>
        </div>

        <div className="glass-card p-5 border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold uppercase">{t('monthlyRate')}</span>
            <DollarSign size={18} />
          </div>
          <p className="text-3xl font-bold text-white">¥299<span className="text-sm font-normal text-slate-400">/mo</span></p>
          <p className="text-xs text-slate-400 mt-1">Includes 120 errand minutes + 20% discount</p>
        </div>

        <div className="glass-card p-5 border border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <span className="text-xs font-semibold uppercase">{t('errandRate')}</span>
            <Clock size={18} />
          </div>
          <p className="text-3xl font-bold text-white">¥150<span className="text-sm font-normal text-slate-400">/hr</span></p>
          <p className="text-xs text-slate-400 mt-1">Total allocated: {totalErrandMinutesAllocated} mins/mo</p>
        </div>
      </div>

      {/* Pricing Configuration Overview */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Tag size={18} className="text-brand-400" />
          BridgeLife Standard Rates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-slate-400 font-medium">{t('membership')}</p>
            <p className="text-xl font-bold text-white mt-1">¥299.00</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Billed monthly per client</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-slate-400 font-medium">{t('errands')}</p>
            <p className="text-xl font-bold text-white mt-1">¥150.00</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Calculated per 15-min increments</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-slate-400 font-medium">{t('documentTranslation')}</p>
            <p className="text-xl font-bold text-white mt-1">¥80.00</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Standard document rate</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-slate-400 font-medium">{t('discountRate')}</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">20% OFF</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Automatic discount for active members</p>
          </div>
        </div>
      </div>

      {/* Active Subscriptions List */}
      <div className="glass-card overflow-hidden space-y-4 p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <CreditCard size={18} className="text-brand-400" />
          {t('activeSubscriptions')}
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-surface-800/80 text-xs text-slate-400 uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="px-4 py-3">{t('subscriber')}</th>
                <th className="px-4 py-3">{t('plan')}</th>
                <th className="px-4 py-3">{t('minutesRemaining')}</th>
                <th className="px-4 py-3">{t('periodEnd')}</th>
                <th className="px-4 py-3">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    {t('noSubscriptions')}
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-white">{(sub.user as any)?.full_name || 'Subscriber'}</p>
                      <p className="text-xs text-slate-500 font-mono">{(sub.user as any)?.preferred_language?.toUpperCase() || 'EN'}</p>
                    </td>

                    <td className="px-4 py-3.5 font-medium text-slate-200">
                      {sub.plan_name || 'BridgeLife Monthly Plan'} (¥{sub.price_cny})
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-300">{sub.errand_minutes_left}</span>
                        <span className="text-slate-500 text-xs">/ {sub.errand_minutes_total} mins</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-slate-400">
                      {sub.current_period_end
                        ? new Date(sub.current_period_end).toLocaleDateString()
                        : 'Active'}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          sub.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                        }`}
                      >
                        {sub.status === 'active' && <CheckCircle size={12} />}
                        {sub.status}
                      </span>
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
