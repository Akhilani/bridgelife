import { createClient, createServiceClient } from '@/lib/supabase/server';
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

  if (!user) redirect(`/${locale}/auth/login?redirectTo=/${locale}/dashboard`);

  const { data } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  let profile = data as { role: UserRole; full_name: string } | null;

  // If profile is missing (trigger may not have run), create it on-the-fly
  if (!profile) {
    const fallbackName =
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'User';
    const fallbackLang = user.user_metadata?.preferred_language || 'en';

    const serviceSupabase = await createServiceClient();
    const { data: upserted } = await serviceSupabase
      .from('profiles')
      .upsert(
        { id: user.id, full_name: fallbackName, preferred_language: fallbackLang, role: 'client' },
        { onConflict: 'id' }
      )
      .select('role, full_name')
      .single();

    profile = upserted as { role: UserRole; full_name: string } | null;
  }

  if (!profile) redirect(`/${locale}/auth/login?redirectTo=/${locale}/dashboard`);

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
