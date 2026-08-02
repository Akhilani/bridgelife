'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg = error.message || error.code || JSON.stringify(error) || 'Unknown auth error';
    return { error: msg };
  }

  // Get user role for redirect
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role, preferred_language')
      .eq('id', user.id)
      .single();

    const profile = profileData as { role: string; preferred_language: string } | null;
    const locale = profile?.preferred_language || 'en';
    const role = profile?.role;

    revalidatePath('/', 'layout');

    if (role === 'admin') redirect(`/${locale}/admin`);
    if (role === 'operator' || role === 'runner') redirect(`/${locale}/ops/queue`);
    redirect(`/${locale}/dashboard`);
  }

  return { error: 'Unknown error' };
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('full_name') as string;
  const preferredLanguage = (formData.get('preferred_language') as string) || 'en';

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        preferred_language: preferredLanguage,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  // Redirect to login with a flag — Supabase may require email confirmation
  // before the session is fully active. The login page will show a notice.
  redirect(`/${preferredLanguage}/auth/login?registered=true`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
