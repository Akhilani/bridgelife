import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MobileNav } from '@/components/layout/MobileNav';
import { Sidebar } from '@/components/layout/Sidebar';
import type { UserRole } from '@/lib/types/database';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const supabase = await createClient();
  const { locale } = await params;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const { data } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  const profile = data as { role: UserRole; full_name: string } | null;

  if (!profile) redirect(`/${locale}/auth/login`);

  return (
    <div className="flex min-h-screen bg-surface-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar role={profile.role} userName={profile.full_name} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
