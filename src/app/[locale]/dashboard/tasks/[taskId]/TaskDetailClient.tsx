// @ts-nocheck
'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  CheckCircle2, Circle, Clock, Loader2, Send, User, Paperclip,
  FileText, AlertCircle, XCircle,
} from 'lucide-react';
import { CATEGORY_LABELS, STATUS_COLORS, formatCNY, timeAgo, getInitials } from '@/lib/utils';
import type { Task, TaskMessage } from '@/lib/types/database';

const STATUS_STEPS: Task['status'][] = [
  'pending',
  'assigned',
  'in_progress',
  'completed',
];

export default function TaskDetailClient({
  task: initialTask,
  messages: initialMessages,
  currentUserId,
  currentUserName,
  currentUserRole,
}: {
  task: Task & { runner?: { full_name: string } | null };
  messages: (TaskMessage & { sender: { full_name: string; role: string } | null })[];
  currentUserId: string;
  currentUserName: string;
  currentUserRole: string;
}) {
  const t = useTranslations('tasks.detail');
  const tStatus = useTranslations('tasks.status');
  const [task, setTask] = useState(initialTask);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Realtime subscriptions
  useEffect(() => {
    const messagesSub = supabase
      .channel(`task-messages-${task.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_messages',
          filter: `task_id=eq.${task.id}`,
        },
        async (payload) => {
          // Fetch sender info
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .eq('id', payload.new.sender_id)
            .single();
          setMessages((prev) => [...prev, { ...payload.new, sender } as any]);
        }
      )
      .subscribe();

    const taskSub = supabase
      .channel(`task-${task.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          filter: `id=eq.${task.id}`,
        },
        (payload) => {
          setTask((prev) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSub);
      supabase.removeChannel(taskSub);
    };
  }, [task.id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const msg = newMessage.trim();
    setNewMessage('');

    const { error } = await supabase.from('task_messages').insert({
      task_id: task.id,
      sender_id: currentUserId,
      message: msg,
    });

    if (error) toast.error('Failed to send message');
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentStepIndex = STATUS_STEPS.indexOf(task.status as Task['status']);
  const isCanceled = task.status === 'canceled';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left Panel: Task Info */}
      <div className="lg:col-span-2 space-y-5">
        {/* Task Header */}
        <div className="glass-card p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <span className={`status-badge ${STATUS_COLORS[task.status]} mb-2 inline-flex`}>
                {tStatus(task.status)}
              </span>
              <h1 className="text-xl font-bold text-white leading-tight">{task.title}</h1>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <InfoRow label={t('price')} value={task.price_cny === 0 ? 'Free (Member)' : formatCNY(task.price_cny)} />
            <InfoRow label="Category" value={CATEGORY_LABELS[task.category]} />
            <InfoRow label={t('created')} value={timeAgo(task.created_at)} />
            {task.runner && (
              <InfoRow label={t('runner')} value={(task.runner as any).full_name} />
            )}
          </div>

          {task.description && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-slate-500 mb-1">Description</p>
              <p className="text-slate-300 text-sm leading-relaxed">{task.description}</p>
            </div>
          )}
        </div>

        {/* Progress Stepper */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">
            {t('progress')}
          </h2>

          {isCanceled ? (
            <div className="flex items-center gap-3 text-red-400">
              <XCircle size={20} />
              <span className="font-medium">Task Canceled</span>
            </div>
          ) : (
            <div className="space-y-0">
              {STATUS_STEPS.map((s, i) => {
                const isCompleted = i < currentStepIndex || (i === currentStepIndex && s === 'completed');
                const isCurrent = i === currentStepIndex && s !== 'completed';
                return (
                  <div key={s} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? 'bg-green-500/20 border border-green-500/40'
                          : isCurrent
                          ? 'bg-brand-500/20 border border-brand-500/40 animate-pulse'
                          : 'bg-surface-600 border border-white/10'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 size={14} className="text-green-400" />
                        ) : isCurrent ? (
                          <Clock size={14} className="text-brand-400" />
                        ) : (
                          <Circle size={14} className="text-slate-700" />
                        )}
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`w-px h-8 mt-1 ${isCompleted ? 'bg-green-500/30' : 'bg-white/5'}`} />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className={`text-sm font-medium ${
                        isCompleted ? 'text-green-400' : isCurrent ? 'text-white' : 'text-slate-600'
                      }`}>
                        {tStatus(s)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Chat */}
      <div className="lg:col-span-3 glass-card flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
        <div className="p-4 border-b border-white/5 flex-shrink-0">
          <h2 className="font-semibold text-white text-sm">{t('chat')}</h2>
        </div>

        {/* Messages */}
        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-600 text-sm">
              {t('noMessages')}
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === currentUserId;
              return (
                <div key={msg.id} className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs text-brand-400 font-semibold flex-shrink-0 self-end">
                    {getInitials(msg.sender?.full_name || 'U')}
                  </div>
                  <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={isOwn ? 'chat-bubble-client' : 'chat-bubble-staff'}>
                      <p className="text-sm text-white leading-relaxed">{msg.message}</p>
                    </div>
                    <span className="text-xs text-slate-600 px-1">{timeAgo(msg.created_at)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5 flex-shrink-0">
          <div className="flex gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('typeMessage')}
              disabled={task.status === 'completed' || task.status === 'canceled'}
              className="flex-1 px-4 py-2.5 bg-surface-700 border border-white/8 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500/50 transition-all disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-gradient text-white hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-500 flex-shrink-0">{label}</span>
      <span className="text-white font-medium text-right">{value}</span>
    </div>
  );
}
