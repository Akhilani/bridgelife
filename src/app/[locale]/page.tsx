import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import type { Profile } from '@/lib/types/database';
import {
  ShoppingBag, Phone, FileText, Car, Shield, Home, Clock, Smartphone,
  ArrowRight, Star, CheckCircle2, ChevronDown,
  Users, Globe, Zap, TrendingUp,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  shopping: ShoppingBag,
  phone_translation: Phone,
  document_translation: FileText,
  ride_booking: Car,
  visa_support: Shield,
  house_hunting: Home,
  errands: Clock,
  app_navigation: Smartphone,
};

const SERVICE_CATEGORIES = [
  'shopping', 'phone_translation', 'document_translation', 'ride_booking',
  'visa_support', 'house_hunting', 'errands', 'app_navigation',
] as const;

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data ?? {
      // Fallback: synthesize from auth metadata if trigger hasn't run yet
      id: user.id,
      full_name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User',
      role: 'client',
      preferred_language: user.user_metadata?.preferred_language ?? 'en',
      phone_number: null,
      wechat_id: null,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Profile;
  }

  return (
    <div className="min-h-screen bg-surface-900">
      <Navbar user={profile} />
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <HowItWorksSection />
      <MembershipSection />
      <TestimonialsSection />
      <FaqSection />
      <FooterSection />
    </div>
  );
}

function HeroSection() {
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-hero-gradient">
      {/* Decorative orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-gold-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230694a2' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="section-container relative z-10 pt-24 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full text-sm text-brand-400 font-medium mb-8 animate-fade-in">
            <Zap size={14} className="animate-pulse-glow" />
            {t('badge')}
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight mb-6 animate-slide-up">
            {t('title')}{' '}
            <span className="gradient-text">{t('titleAccent')}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in">
            {t('subtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link
              href="/auth/register"
              className="group flex items-center gap-2 px-8 py-4 bg-teal-gradient text-white font-semibold rounded-xl shadow-glow-teal hover:opacity-90 btn-glow transition-all text-base"
            >
              {t('cta')}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/#services"
              className="flex items-center gap-2 px-8 py-4 glass-card text-white font-medium rounded-xl hover:border-brand-500/30 transition-all text-base"
            >
              {t('ctaSecondary')}
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-6 mt-12 text-sm text-slate-500 flex-wrap animate-fade-in">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-green-400" />
              {t('trustNoChinese')}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-green-400" />
              {t('trustCancel')}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-green-400" />
              {t('trustPayments')}
            </span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <ChevronDown size={24} className="text-slate-600" />
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const t = useTranslations('hero.stats');
  const stats = [
    { icon: Users, label: t('clients') },
    { icon: Globe, label: t('languages') },
    { icon: Zap, label: t('availability') },
    { icon: TrendingUp, label: t('tasks') },
  ];

  return (
    <section className="py-12 border-b border-white/5">
      <div className="section-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-5 text-center hover:border-brand-500/20 transition-all">
              <stat.icon size={20} className="text-brand-400 mx-auto mb-2" />
              <p className="text-white font-semibold text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const t = useTranslations('services');

  return (
    <section id="services" className="py-24">
      <div className="section-container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {t('title')} <span className="gradient-text">{t('titleAccent')}</span>
          </h2>
          <p className="text-slate-400 text-lg">{t('subtitle')}</p>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICE_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            return (
              <Link
                key={cat}
                href="/auth/register"
                className="glass-card p-6 group hover:border-brand-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer block"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                  <Icon size={20} className="text-brand-400" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1.5">
                  {t(`items.${cat}.name`)}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-3">
                  {t(`items.${cat}.description`)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-brand-400 text-xs font-medium">
                    {t(`items.${cat}.price`)}
                  </span>
                  <ArrowRight size={12} className="text-slate-600 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const t = useTranslations('howItWorks');
  const steps = ['submit', 'assign', 'done'] as const;

  return (
    <section className="py-24 border-t border-white/5">
      <div className="section-container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {t('title')} <span className="gradient-text">{t('titleAccent')}</span>
          </h2>
          <p className="text-slate-400 text-lg">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-10 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-px bg-gradient-to-r from-brand-500/40 via-brand-400/60 to-brand-500/40" />

          {steps.map((step, i) => (
            <div key={step} className="relative flex flex-col items-center text-center group">
              {/* Step number */}
              <div className="w-20 h-20 rounded-2xl bg-teal-gradient flex items-center justify-center text-3xl font-bold text-white shadow-glow-teal mb-6 group-hover:scale-110 transition-transform z-10">
                {i + 1}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {t(`steps.${step}.title`)}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t(`steps.${step}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MembershipSection() {
  const t = useTranslations('membership');
  const features = ['freeProxy', 'errands', 'discount', 'priority', 'chat', 'support'] as const;

  return (
    <section id="pricing" className="py-24 border-t border-white/5">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {t('title')} <span className="gradient-text">{t('titleAccent')}</span>
            </h2>
            <p className="text-slate-400 text-lg">{t('subtitle')}</p>
          </div>

          <div className="glass-card p-8 md:p-12 border-brand-500/20 relative overflow-hidden">
            {/* Glow background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
              {/* Price */}
              <div>
                <div className="inline-flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-bold text-slate-400">{t('currency')}</span>
                  <span className="text-7xl font-extrabold gradient-text">{t('price')}</span>
                  <span className="text-slate-400 text-lg">{t('period')}</span>
                </div>
                <p className="text-slate-400 mb-8 text-sm leading-relaxed max-w-xs">
                  {t('description')}
                </p>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-teal-gradient text-white font-semibold rounded-xl shadow-glow-teal hover:opacity-90 btn-glow transition-all"
                >
                  {t('cta')}
                  <ArrowRight size={18} />
                </Link>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {features.map((feat) => (
                  <div key={feat} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={12} className="text-green-400" />
                    </div>
                    <span className="text-slate-300 text-sm">{t(`features.${feat}`)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const t = useTranslations('testimonials');
  const items = [0, 1, 2] as const;

  return (
    <section className="py-24 border-t border-white/5">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            {t('title')} <span className="gradient-text">{t('titleAccent')}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((i) => (
            <div key={i} className="glass-card p-6 hover:border-brand-500/20 transition-all">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={14} className="fill-gold-400 text-gold-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-5 italic">
                &ldquo;{t(`items.${i}.quote`)}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 text-sm font-semibold">
                  {t(`items.${i}.name`).charAt(0)}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{t(`items.${i}.name`)}</p>
                  <p className="text-slate-500 text-xs">{t(`items.${i}.role`)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const t = useTranslations('faq');

  return (
    <section className="py-24 border-t border-white/5">
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              {t('title')} <span className="gradient-text">{t('titleAccent')}</span>
            </h2>
          </div>

          <div className="space-y-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <FaqItem
                key={i}
                question={t(`items.${i as 0}.question`)}
                answer={t(`items.${i as 0}.answer`)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="glass-card group">
      <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
        <span className="text-white font-medium text-sm">{question}</span>
        <ChevronDown
          size={16}
          className="text-slate-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4"
        />
      </summary>
      <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
        {answer}
      </div>
    </details>
  );
}

function FooterSection() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-white/5 py-12">
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-gradient flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-base">
              Bridge<span className="gradient-text">Life</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 flex-wrap justify-center">
            {(['services', 'pricing', 'about', 'privacy', 'terms'] as const).map((link) => (
              <Link
                key={link}
                href="/"
                className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
              >
                {t(`links.${link}`)}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-slate-600 text-xs">{t('copyright')}</p>
        </div>

        <div className="mt-6 text-center text-slate-700 text-xs">
          {t('madeIn')}
        </div>
      </div>
    </footer>
  );
}
