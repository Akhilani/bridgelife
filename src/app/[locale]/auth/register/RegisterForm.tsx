'use client';

import { useTranslations } from 'next-intl';
import { signUp } from '@/actions/auth';
import { useState } from 'react';
import { User, Mail, Lock, Globe, Loader2, Eye, EyeOff } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English 🇬🇧' },
  { code: 'fr', label: 'Français 🇫🇷' },
  { code: 'zh', label: '中文 🇨🇳' },
];

export default function RegisterForm() {
  const t = useTranslations('auth.register');
  const tErr = useTranslations('auth.errors');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    if ((fd.get('password') as string).length < 8) {
      setError(tErr('weakPassword'));
      setLoading(false);
      return;
    }
    const result = await signUp(fd);
    if (result?.error) {
      setError(result.error.includes('already') ? tErr('emailInUse') : tErr('generic'));
    }
    setLoading(false);
  }

  const inputClass =
    'w-full pl-10 pr-4 py-3 bg-surface-700 border border-white/8 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('name')}</label>
        <div className="relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input name="full_name" type="text" required placeholder="Thomas Martin" className={inputClass} />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('email')}</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input name="email" type="email" required placeholder="you@example.com" className={inputClass} />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('password')}</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            name="password"
            type={showPw ? 'text' : 'password'}
            required
            minLength={8}
            placeholder="Min. 8 characters"
            className="w-full pl-10 pr-10 py-3 bg-surface-700 border border-white/8 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all"
          />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('language')}</label>
        <div className="relative">
          <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <select
            name="preferred_language"
            defaultValue="en"
            className="w-full pl-10 pr-4 py-3 bg-surface-700 border border-white/8 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500/60 transition-all appearance-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-surface-700">{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-teal-gradient text-white font-semibold rounded-lg shadow-glow-teal hover:opacity-90 btn-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" />{t('loading')}</>
        ) : t('submit')}
      </button>
    </form>
  );
}
