'use client';

import { useTranslations } from 'next-intl';
import { signIn } from '@/actions/auth';
import { useState } from 'react';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const t = useTranslations('auth.login');
  const tErr = useTranslations('auth.errors');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await signIn(new FormData(e.currentTarget));
      if (result?.error) {
        const msg = result.error.toLowerCase();
        if (msg.includes('invalid') || msg.includes('credentials') || msg.includes('password')) {
          setError(tErr('invalidCredentials'));
        } else if (msg.includes('confirm') || msg.includes('verified') || msg.includes('email')) {
          setError(tErr('emailNotConfirmed'));
        } else {
          // Show the raw Supabase error for easier debugging
          setError(result.error);
        }
      }
    } catch (err: unknown) {
      // redirect() throws a special Next.js error — let it propagate
      if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err;
      // Any other unexpected client-side error
      setError(tErr('generic'));
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {t('email')}
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full pl-10 pr-4 py-3 bg-surface-700 border border-white/8 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {t('password')}
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            name="password"
            type={showPw ? 'text' : 'password'}
            required
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-3 bg-surface-700 border border-white/8 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
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
          <>
            <Loader2 size={16} className="animate-spin" />
            {t('loading')}
          </>
        ) : (
          t('submit')
        )}
      </button>
    </form>
  );
}
