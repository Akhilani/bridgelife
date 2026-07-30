import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import type { UserRole } from '@/lib/types/database';

export default async function AdminLayout({
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

  const { data } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  const profile = data as { full_name: string; role: UserRole } | null;

  if (profile?.role !== 'admin') redirect(`/${locale}/dashboard`);

  return (
    <div className="flex min-h-screen bg-surface-900">
      <Sidebar role="admin" userName={profile!.full_name} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
