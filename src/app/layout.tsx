import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_SC } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  variable: '--font-noto-sc',
  display: 'swap',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'BridgeLife — Shanghai Expat Concierge',
  description:
    'Expert concierge services for expats in China. Proxy shopping, document translation, visa support, and more — in English, French, and Chinese.',
  keywords: ['Shanghai', 'expat', 'concierge', 'proxy shopping', 'visa support', 'China'],
  manifest: '/manifest.json',
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#080c14',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${inter.variable} ${notoSansSC.variable}`} suppressHydrationWarning>
      <body className="bg-surface-900 text-slate-100 font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
