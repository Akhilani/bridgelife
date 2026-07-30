// @ts-nocheck
'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  ShoppingBag, Phone, FileText, Car, Shield, Home, Clock, Smartphone,
  ArrowRight, ArrowLeft, CheckCircle2, Upload, Loader2, MapPin,
} from 'lucide-react';
import type { TaskCategory } from '@/lib/types/database';
import { formatCNY } from '@/lib/utils';
import { useParams } from 'next/navigation';

const CATEGORIES: { id: TaskCategory; icon: React.ElementType; basePrice: number; memberFree?: boolean }[] = [
  { id: 'shopping',             icon: ShoppingBag, basePrice: 50,   memberFree: true },
  { id: 'phone_translation',    icon: Phone,       basePrice: 200   },
  { id: 'document_translation', icon: FileText,    basePrice: 150   },
  { id: 'ride_booking',         icon: Car,         basePrice: 30,   memberFree: true },
  { id: 'visa_support',         icon: Shield,      basePrice: 300   },
  { id: 'house_hunting',        icon: Home,        basePrice: 800   },
  { id: 'errands',              icon: Clock,       basePrice: 200   },
  { id: 'app_navigation',       icon: Smartphone,  basePrice: 100   },
];

const DISCOUNT = 0.8; // 20% off for members

export default function NewTaskWizard() {
  const t = useTranslations('tasks.wizard');
  const tServices = useTranslations('services.items');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const searchParams = useSearchParams();
  const defaultCategory = searchParams.get('category') as TaskCategory | null;

  const [step, setStep] = useState(defaultCategory ? 1 : 0);
  const [category, setCategory] = useState<TaskCategory | null>(defaultCategory);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMember] = useState(false); // Would come from subscription query

  const selectedCat = CATEGORIES.find((c) => c.id === category);
  const basePrice = selectedCat?.basePrice || 0;
  const finalPrice =
    isMember && selectedCat?.memberFree
      ? 0
      : isMember
      ? Math.round(basePrice * DISCOUNT)
      : basePrice;

  const STEPS = [
    t('steps.category'),
    t('steps.details'),
    t('steps.attachments'),
    t('steps.review'),
  ];

  async function handleSubmit() {
    if (!category || !title) return;
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase.from('tasks').insert({
      client_id: user.id,
      category,
      title,
      description: description || null,
      location: location || null,
      price_cny: finalPrice,
      is_member_discount: isMember,
      status: 'pending',
      priority: 1,
    }).select().single();

    if (error) {
      toast.error('Failed to submit task. Please try again.');
      setLoading(false);
      return;
    }

    // Upload attachments if any
    if (attachments.length > 0 && data) {
      for (const file of attachments) {
        const filePath = `tasks/${data.id}/${file.name}`;
        await supabase.storage
          .from(process.env.NEXT_PUBLIC_STORAGE_BUCKET_ATTACHMENTS || 'task-attachments')
          .upload(filePath, file);
      }
    }

    toast.success('Task submitted successfully!');
    router.push(`/${locale}/dashboard/tasks/${data?.id}`);
  }

  return (
    <div className="p-5 md:p-8 max-w-3xl">
      {/* Header */}
      <h1 className="text-2xl font-bold text-white mb-8">{t('title')}</h1>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-shrink-0">
            <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
              i === step
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                : i < step
                ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                : 'text-slate-600 glass-card'
            }`}>
              {i < step ? <CheckCircle2 size={12} /> : <span>{i + 1}</span>}
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-px flex-shrink-0 ${i < step ? 'bg-green-500/40' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0 — Category */}
      {step === 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">{t('category.title')}</h2>
          <p className="text-slate-400 text-sm mb-6">{t('category.subtitle')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setCategory(id); setStep(1); }}
                className={`glass-card p-4 flex flex-col items-center gap-3 text-center hover:border-brand-500/40 hover:-translate-y-1 transition-all group ${
                  category === id ? 'border-brand-500/50 bg-brand-500/10' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon size={18} className="text-brand-400" />
                </div>
                <span className="text-xs font-medium text-slate-300 leading-tight">
                  {tServices(`${id}.name`)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1 — Details */}
      {step === 1 && (
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-white mb-2">{t('details.title')}</h2>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              {t('details.titleLabel')} <span className="text-red-400">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${tServices(`${category}.name`)} - ...`}
              className="w-full px-4 py-3 bg-surface-700 border border-white/8 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              {t('details.descriptionLabel')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder={t('details.descriptionPlaceholder')}
              className="w-full px-4 py-3 bg-surface-700 border border-white/8 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              {t('details.locationLabel')}
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('details.locationPlaceholder')}
                className="w-full pl-10 pr-4 py-3 bg-surface-700 border border-white/8 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all"
              />
            </div>
          </div>
          <WizardNav step={step} setStep={setStep} canNext={!!title} backLabel="Back" nextLabel="Next" />
        </div>
      )}

      {/* Step 2 — Attachments */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">{t('attachments.title')}</h2>
          <p className="text-slate-400 text-sm mb-6">{t('attachments.subtitle')}</p>

          {/* Dropzone */}
          <label className="block glass-card p-10 text-center cursor-pointer hover:border-brand-500/30 transition-all border-dashed">
            <Upload size={28} className="text-slate-500 mx-auto mb-3" />
            <p className="text-slate-300 text-sm font-medium mb-1">{t('attachments.dropzone')}</p>
            <p className="text-slate-600 text-xs">{t('attachments.types')}</p>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.docx,.mp3,.mp4"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  setAttachments(Array.from(e.target.files));
                }
              }}
            />
          </label>

          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((file, i) => (
                <div key={i} className="glass-card p-3 flex items-center gap-3">
                  <FileText size={14} className="text-brand-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300 truncate">{file.name}</span>
                  <span className="text-xs text-slate-600 flex-shrink-0 ml-auto">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
              ))}
            </div>
          )}

          <WizardNav step={step} setStep={setStep} canNext backLabel="Back" nextLabel="Next" />
        </div>
      )}

      {/* Step 3 — Review */}
      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-white mb-2">{t('review.title')}</h2>

          <div className="glass-card p-6 space-y-4">
            <ReviewRow label={t('review.service')} value={category ? tServices(`${category}.name`) : ''} />
            <div className="h-px bg-white/5" />
            <ReviewRow label={t('review.description')} value={description || '—'} multi />
            {location && (
              <>
                <div className="h-px bg-white/5" />
                <ReviewRow label="Location" value={location} />
              </>
            )}
            {attachments.length > 0 && (
              <>
                <div className="h-px bg-white/5" />
                <ReviewRow label="Attachments" value={`${attachments.length} file(s)`} />
              </>
            )}
            <div className="h-px bg-white/5" />
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">{t('review.price')}</span>
              <div className="text-right">
                <span className="text-xl font-bold text-white">
                  {finalPrice === 0 ? 'Free' : formatCNY(finalPrice)}
                </span>
                {isMember && finalPrice < basePrice && (
                  <p className="text-xs text-green-400">{t('review.memberDiscount')}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-5 py-3 glass-card text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-all"
            >
              <ArrowLeft size={16} />
              {t('review.back')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-gradient text-white font-semibold rounded-lg shadow-glow-teal hover:opacity-90 btn-glow transition-all disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" />{t('review.loading')}</>
              ) : (
                <><CheckCircle2 size={16} />{t('review.confirm')}</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function WizardNav({
  step,
  setStep,
  canNext,
  backLabel,
  nextLabel,
}: {
  step: number;
  setStep: (s: number) => void;
  canNext: boolean;
  backLabel: string;
  nextLabel: string;
}) {
  return (
    <div className="flex gap-3 pt-4">
      <button
        onClick={() => setStep(step - 1)}
        className="flex items-center gap-2 px-5 py-3 glass-card text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-all"
      >
        <ArrowLeft size={16} />
        {backLabel}
      </button>
      <button
        onClick={() => setStep(step + 1)}
        disabled={!canNext}
        className="flex items-center gap-2 px-6 py-3 bg-teal-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {nextLabel}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

function ReviewRow({ label, value, multi }: { label: string; value: string; multi?: boolean }) {
  return (
    <div className={`flex ${multi ? 'flex-col gap-1' : 'items-center justify-between'}`}>
      <span className="text-slate-500 text-sm">{label}</span>
      <span className={`text-white text-sm ${multi ? 'leading-relaxed' : 'font-medium'}`}>
        {value}
      </span>
    </div>
  );
}


