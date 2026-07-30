import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCNY(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const CATEGORY_LABELS: Record<string, string> = {
  shopping: 'Proxy Shopping',
  phone_translation: 'Phone Translation',
  document_translation: 'Document Translation',
  app_navigation: 'App Navigation',
  visa_support: 'Visa Support',
  ride_booking: 'Ride Booking',
  house_hunting: 'House Hunting',
  errands: 'Errands',
};

export const STATUS_COLORS: Record<string, string> = {
  pending:         'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  assigned:        'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_progress:     'bg-brand-500/20 text-brand-400 border-brand-500/30',
  action_required: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  completed:       'bg-green-500/20 text-green-400 border-green-500/30',
  canceled:        'bg-red-500/20 text-red-400 border-red-500/30',
};
