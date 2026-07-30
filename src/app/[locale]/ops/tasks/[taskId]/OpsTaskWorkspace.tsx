// @ts-nocheck
'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Play, Square, Clock, Send, Loader2, User, Phone, MessageSquare,
  FileText, ChevronDown, DollarSign,
} from 'lucide-react';
import { CATEGORY_LABELS, STATUS_COLORS, formatCNY, formatMinutes, timeAgo, getInitials } from '@/lib/utils';
import type { Task, TaskMessage } from '@/lib/types/database';

const STATUS_OPTIONS: Task['status'][] = [
  'pending', 'assigned', 'in_progress', 'action_required', 'completed', 'canceled',
];

export default function OpsTaskWorkspace({
  task: initialTask,
  messages: initialMessages,
  currentUserId,
  currentUserName,
  currentUserRole,
}: {
  task: Task & {
    client: { id: string; full_name: string; preferred_language: string; phone_number: string | null; wechat_id: string | null } | null;
    runner: { full_name: string } | null;
    errand_sessions: any[];
  };
  messages: (TaskMessage & { sender: { full_name: string; role: string } | null })[];
  currentUserId: string;
  currentUserName: string;
  currentUserRole: string;
}) {
  const t = useTranslations('ops.workspace');
  const tTimer = useTranslations('ops.workspace.timer');
  const supabase = createClient();

  const [task, setTask] = useState(initialTask);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Errand Timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const RATE_CNY_PER_HOUR = 200;

  const charge = Math.round((elapsed / 3600) * RATE_CNY_PER_HOUR * 100) / 100;

  // Timer tick
  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning]);

  const formatElapsed = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const startTimer = async () => {
    const { data, error } = await supabase
      .from('errand_sessions')
      .insert({ task_id: task.id, runner_id: currentUserId, hourly_rate_cny: RATE_CNY_PER_HOUR })
      .select()
      .single();
    if (error) { toast.error('Failed to start timer'); return; }
    setSessionId(data.id);
    setTimerRunning(true);
    toast.success('Timer started');
  };

  const stopTimer = async () => {
    setTimerRunning(false);
    if (!sessionId) return;
    const minutes = Math.ceil(elapsed / 60);
    await supabase
      .from('errand_sessions')
      .update({
        ended_at: new Date().toISOString(),
        duration_minutes: minutes,
        total_charge_cny: charge,
      })
      .eq('id', sessionId);
    toast.success(`Session ended: ${formatMinutes(minutes)} (${formatCNY(charge)})`);
  };

  // Realtime messages
  useEffect(() => {
    const chan = supabase
      .channel(`ops-messages-${task.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'task_messages',
        filter: `task_id=eq.${task.id}`,
      }, async (payload) => {
        const { data: sender } = await supabase
          .from('profiles').select('id, full_name, role').eq('id', payload.new.sender_id).single();
        setMessages((prev) => [...prev, { ...payload.new, sender } as any]);
      })
      .subscribe();
    return () => { supabase.removeChannel(chan); };
  }, [task.id]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    const msg = newMessage.trim();
    setNewMessage('');
    await supabase.from('task_messages').insert({ task_id: task.id, sender_id: currentUserId, message: msg });
    setSending(false);
  };

  const updateStatus = async (status: Task['status']) => {
    const { error } = await supabase.from('tasks').update({ status }).eq('id', task.id);
    if (!error) { setTask((t) => ({ ...t, status })); toast.success('Status updated'); }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* LEFT: Task Details */}
      <div className="xl:col-span-2 space-y-5">
        {/* Task Info */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`status-badge ${STATUS_COLORS[task.status]}`}>{task.status.replace('_', ' ')}</span>

            {/* Status Changer */}
            <div className="relative">
              <select
                value={task.status}
                onChange={(e) => updateStatus(e.target.value as Task['status'])}
                className="text-xs bg-surface-600 border border-white/10 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none appearance-none pr-6"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <h1 className="text-xl font-bold text-white mb-4 leading-snug">{task.title}</h1>

          <div className="space-y-2.5 text-sm">
            <Row label={t('category')} value={CATEGORY_LABELS[task.category]} />
            <Row label={t('created')} value={timeAgo(task.created_at)} />
            <Row label="Price" value={task.price_cny === 0 ? 'Free (Member)' : formatCNY(task.price_cny)} />
            {task.runner && <Row label="Runner" value={task.runner.full_name} />}
          </div>

          {task.description && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-slate-500 mb-2">{t('description')}</p>
              <p className="text-slate-300 text-sm leading-relaxed">{task.description}</p>
            </div>
          )}
        </div>

        {/* Client Info */}
        {task.client && (
          <div className="glass-card p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <User size={15} className="text-brand-400" />
              {t('client')}
            </h2>
            <div className="space-y-2.5 text-sm">
              <Row label="Name" value={task.client.full_name} />
              <Row label="Language" value={task.client.preferred_language.toUpperCase()} />
              {task.client.phone_number && <Row label="Phone" value={task.client.phone_number} />}
              {task.client.wechat_id && <Row label="WeChat" value={task.client.wechat_id} />}
            </div>
          </div>
        )}

        {/* Errand Timer */}
        {task.category === 'errands' && (
          <div className="glass-card p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Clock size={15} className="text-brand-400" />
              {tTimer('title')}
            </h2>

            <div className="text-center mb-5">
              <div className={`text-4xl font-mono font-bold mb-1 ${timerRunning ? 'text-brand-400' : 'text-white'}`}>
                {formatElapsed(elapsed)}
              </div>
              <p className="text-slate-500 text-sm">
                {tTimer('charge')}: <span className="text-white font-semibold">{formatCNY(charge)}</span>
              </p>
              <p className="text-slate-600 text-xs">{tTimer('rate')}: ¥{RATE_CNY_PER_HOUR}/hr</p>
            </div>

            <button
              onClick={timerRunning ? stopTimer : startTimer}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                timerRunning
                  ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                  : 'bg-teal-gradient text-white shadow-glow-teal hover:opacity-90'
              }`}
            >
              {timerRunning ? (
                <><Square size={16} />{tTimer('stop')}</>
              ) : (
                <><Play size={16} />{tTimer('start')}</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* RIGHT: Chat */}
      <div
        className="xl:col-span-3 glass-card flex flex-col"
        style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}
      >
        <div className="p-4 border-b border-white/5 flex-shrink-0">
          <h2 className="font-semibold text-white text-sm flex items-center gap-2">
            <MessageSquare size={15} className="text-brand-400" />
            Client Chat
          </h2>
        </div>

        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-600 text-sm">
              No messages yet. Start the conversation.
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === currentUserId;
              return (
                <div key={msg.id} className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs text-brand-400 font-semibold flex-shrink-0 self-end">
                    {getInitials(msg.sender?.full_name || 'U')}
                  </div>
                  <div className={`max-w-[75%] flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                    {!isOwn && (
                      <span className="text-xs text-slate-600 px-1">{msg.sender?.full_name}</span>
                    )}
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

        <div className="p-4 border-t border-white/5 flex-shrink-0">
          <div className="flex gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
              placeholder="Message to client..."
              className="flex-1 px-4 py-2.5 bg-surface-700 border border-white/8 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500/50 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-gradient text-white hover:opacity-90 transition-all disabled:opacity-40"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}
