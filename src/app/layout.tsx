import type { Metadata, Viewport } from 'next';
import './globals.css';

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
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
