'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
] as const;

export function LanguageToggle() {
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as string;
  const [open, setOpen] = useState(false);

  const handleSwitch = (locale: string) => {
    router.replace(pathname, { locale });
    setOpen(false);
  };

  const current = LANGUAGES.find((l) => l.code === currentLocale) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
          'text-slate-300 hover:text-white hover:bg-white/5',
          'transition-all duration-200 border border-transparent hover:border-white/10'
        )}
        aria-label={t('language')}
      >
        <Globe size={15} className="text-brand-400" />
        <span className="hidden sm:inline">{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <span className="sm:hidden">{current.flag}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-44 glass-card shadow-glass z-50 overflow-hidden animate-slide-down">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSwitch(lang.code)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-sm',
                  'hover:bg-white/5 transition-colors duration-150 text-left',
                  lang.code === currentLocale
                    ? 'text-brand-400 bg-brand-500/10'
                    : 'text-slate-300'
                )}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.label}</span>
                {lang.code === currentLocale && (
                  <span className="ml-auto text-brand-400 text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
