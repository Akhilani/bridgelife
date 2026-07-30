// @ts-nocheck
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Ops Portal — BridgeLife' };

export default async function OpsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const supabase = await createClient();
  const { locale } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !['operator', 'runner', 'admin'].includes(profile.role)) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="flex min-h-screen bg-surface-900">
      <Sidebar role={profile.role} userName={profile.full_name} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
