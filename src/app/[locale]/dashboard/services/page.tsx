import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import {
  ShoppingBag, Phone, FileText, Car, Shield, Home, Clock, Smartphone, ArrowRight,
} from 'lucide-react';
import type { Metadata } from 'next';
import type { TaskCategory } from '@/lib/types/database';

export const metadata: Metadata = { title: 'Services' };

const SERVICES: { category: TaskCategory; icon: React.ElementType; color: string }[] = [
  { category: 'shopping',             icon: ShoppingBag, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'   },
  { category: 'phone_translation',    icon: Phone,       color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  { category: 'document_translation', icon: FileText,    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  { category: 'ride_booking',         icon: Car,         color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { category: 'visa_support',         icon: Shield,      color: 'text-red-400 bg-red-500/10 border-red-500/20'     },
  { category: 'house_hunting',        icon: Home,        color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  { category: 'errands',              icon: Clock,       color: 'text-teal-400 bg-teal-500/10 border-teal-500/20'   },
  { category: 'app_navigation',       icon: Smartphone,  color: 'text-pink-400 bg-pink-500/10 border-pink-500/20'   },
];

export default async function ServicesPage() {
  const t = await getTranslations('services');

  return (
    <div className="p-5 md:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {t('title')} <span className="gradient-text">{t('titleAccent')}</span>
        </h1>
        <p className="text-slate-400">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {SERVICES.map(({ category, icon: Icon, color }) => (
          <Link
            key={category}
            href={`/dashboard/tasks/new?category=${category}` as '/dashboard'}
            className="glass-card p-6 group hover:border-brand-500/30 hover:-translate-y-1 transition-all duration-300 block"
          >
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${color}`}>
              <Icon size={22} />
            </div>
            <h3 className="font-semibold text-white text-sm mb-2">
              {t(`items.${category}.name`)}
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-3">
              {t(`items.${category}.description`)}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-brand-400 text-xs font-medium bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
                {t(`items.${category}.price`)}
              </span>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
