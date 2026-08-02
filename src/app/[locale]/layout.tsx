import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | BridgeLife',
    default: 'BridgeLife — Shanghai Expat Concierge',
  },
  description:
    'Expert concierge services for expats in China. Proxy shopping, document translation, visa support, and more.',
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as 'en' | 'fr' | 'zh')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ReactQueryProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a2235',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f1f5f9',
            },
          }}
        />
      </ReactQueryProvider>
    </NextIntlClientProvider>
  );
}
