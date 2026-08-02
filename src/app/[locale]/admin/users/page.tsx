import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { UsersManager } from './UsersManager';
import type { Metadata } from 'next';
import type { Profile, Subscription } from '@/lib/types/database';

export const metadata: Metadata = { title: 'User Management — Admin' };

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const t = await getTranslations('admin.users');

  // Fetch all profiles
  const { data: rawProfiles = [] } = await (supabase.from('profiles') as any)
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch active subscriptions map
  const { data: rawSubs = [] } = await (supabase.from('subscriptions') as any)
    .select('*');

  const profiles = (rawProfiles || []) as Profile[];
  const subscriptions = (rawSubs || []) as Subscription[];

  const subMap = new Map<string, Subscription>(subscriptions.map((s) => [s.user_id, s]));

  const extendedProfiles = profiles.map((p) => ({
    ...p,
    subscription: subMap.get(p.id) || null,
  }));

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">{t('title')}</h1>
        <p className="text-slate-400 text-sm mt-1">{t('subtitle')}</p>
      </div>

      <UsersManager initialProfiles={extendedProfiles} />
    </div>
  );
}
