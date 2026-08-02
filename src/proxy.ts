import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Routes accessible only when authenticated (prefix match)
const PROTECTED_PREFIXES = ['/dashboard', '/ops', '/admin'];
// Routes accessible only when NOT authenticated
const AUTH_ROUTES = ['/auth/login', '/auth/register'];

// Role-gated route prefixes
const ROLE_ROUTES: Record<string, string[]> = {
  '/ops':   ['operator', 'runner', 'admin'],
  '/admin': ['admin'],
};

export async function proxy(request: NextRequest) {
  // Run intl middleware first to handle locale routing
  const intlResponse = intlMiddleware(request);

  const { pathname } = request.nextUrl;

  // Strip locale prefix for route matching (/en/dashboard -> /dashboard)
  const strippedPath = pathname.replace(/^\/(en|fr|zh)/, '');

  const isProtected = PROTECTED_PREFIXES.some((p) => strippedPath.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => strippedPath.startsWith(p));

  if (!isProtected && !isAuthRoute) {
    return intlResponse;
  }

  // Build Supabase client (session refresh)
  let response = intlResponse || NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Detect locale from path
  const localeMatch = pathname.match(/^\/(en|fr|zh)/);
  const locale = localeMatch ? localeMatch[1] : 'en';

  // Redirect unauthenticated users trying to access protected routes
  if (isProtected && !user) {
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Role-based access control
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role;

    for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
      if (strippedPath.startsWith(routePrefix) && role && !allowedRoles.includes(role)) {
        // Redirect to appropriate portal based on role
        const roleRedirects: Record<string, string> = {
          client:   `/${locale}/dashboard`,
          operator: `/${locale}/ops/queue`,
          runner:   `/${locale}/ops/queue`,
          admin:    `/${locale}/admin`,
        };
        return NextResponse.redirect(
          new URL(roleRedirects[role] || `/${locale}/dashboard`, request.url)
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files, api routes handled by Next.js
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)',
  ],
};
