import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { PricingManager } from './PricingManager';
import type { Metadata } from 'next';
import type { Subscription } from '@/lib/types/database';

export const metadata: Metadata = { title: 'Pricing & Subscriptions — Admin' };

export default async function AdminPricingPage() {
  const supabase = await createClient();
  const t = await getTranslations('admin.pricing');

  // Fetch subscriptions with user profile details
  const { data: subscriptions = [] } = await (supabase.from('subscriptions') as any)
    .select(`*, user:user_id(full_name, preferred_language)`)
    .order('created_at', { ascending: false });

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
        <p className="text-slate-400 text-sm mt-1">{t('subtitle')}</p>
      </div>

      <PricingManager subscriptions={(subscriptions || []) as Subscription[]} />
    </div>
  );
}
