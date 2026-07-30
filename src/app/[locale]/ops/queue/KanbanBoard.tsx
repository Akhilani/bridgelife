// @ts-nocheck
'use client';

import { useTranslations } from 'next-intl';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Link } from '@/i18n/routing';
import { CATEGORY_LABELS, STATUS_COLORS, timeAgo } from '@/lib/utils';
import { ChevronRight, User } from 'lucide-react';
import type { Task } from '@/lib/types/database';

type ColumnId = 'pending' | 'in_progress' | 'action_required';

const COLUMNS: { id: ColumnId; labelKey: string; color: string }[] = [
  { id: 'pending',          labelKey: 'ops.queue.columns.unassigned',    color: 'border-yellow-500/30' },
  { id: 'in_progress',      labelKey: 'ops.queue.columns.in_progress',   color: 'border-brand-500/30' },
  { id: 'action_required',  labelKey: 'ops.queue.columns.pendingClient', color: 'border-orange-500/30' },
];

interface Runner { id: string; full_name: string }

export default function KanbanBoard({
  tasks: initialTasks,
  runners,
}: {
  tasks: (Task & { client: { full_name: string } | null; runner: { full_name: string } | null })[];
  runners: Runner[];
}) {
  const t = useTranslations();
  const supabase = createClient();
  const [tasks, setTasks] = useState(initialTasks);

  const getColumnTasks = (columnId: ColumnId) =>
    tasks.filter((t) => t.status === columnId);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as ColumnId;
    
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    );

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', draggableId);

    if (error) {
      toast.error('Failed to update task status');
      // Revert
      setTasks(initialTasks);
    } else {
      toast.success('Task moved successfully');
    }
  };

  const assignRunner = async (taskId: string, runnerId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ runner_id: runnerId, status: 'assigned' })
      .eq('id', taskId);

    if (error) {
      toast.error('Failed to assign runner');
    } else {
      const runner = runners.find((r) => r.id === runnerId);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, runner_id: runnerId, runner: { full_name: runner?.full_name || '' }, status: 'assigned' }
            : t
        )
      );
      toast.success(`Assigned to ${runner?.full_name}`);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 min-h-[calc(100vh-220px)]">
        {COLUMNS.map((col) => {
          const columnTasks = getColumnTasks(col.id);
          return (
            <div key={col.id} className={`glass-card border-t-2 ${col.color} flex flex-col`}>
              {/* Column Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-semibold text-white text-sm">{t(col.labelKey as 'nav.home')}</h3>
                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-slate-400">
                  {columnTasks.length}
                </span>
              </div>

              {/* Droppable */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 space-y-3 transition-colors min-h-[100px] ${
                      snapshot.isDraggingOver ? 'bg-brand-500/5' : ''
                    }`}
                  >
                    {columnTasks.length === 0 && (
                      <div className="text-center py-8 text-slate-700 text-sm">
                        {t('ops.queue.noTasks')}
                      </div>
                    )}

                    {columnTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`kanban-card ${snapshot.isDragging ? 'rotate-1 shadow-glass opacity-95' : ''}`}
                          >
                            {/* Category badge */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
                                {CATEGORY_LABELS[task.category]}
                              </span>
                              <span className="text-xs text-slate-600">{timeAgo(task.created_at)}</span>
                            </div>

                            {/* Title */}
                            <p className="text-white text-sm font-medium leading-snug mb-2 line-clamp-2">
                              {task.title}
                            </p>

                            {/* Client */}
                            <div className="flex items-center gap-1.5 mb-3">
                              <User size={11} className="text-slate-500" />
                              <span className="text-slate-500 text-xs">
                                {task.client?.full_name || 'Client'}
                              </span>
                            </div>

                            {/* Runner Assignment */}
                            {!task.runner_id && col.id === 'pending' ? (
                              <select
                                onChange={(e) => e.target.value && assignRunner(task.id, e.target.value)}
                                defaultValue=""
                                onClick={(e) => e.stopPropagation()}
                                className="w-full text-xs bg-surface-600 border border-white/8 rounded-lg px-2 py-1.5 text-slate-400 focus:outline-none focus:border-brand-500/40 transition-all"
                              >
                                <option value="">{t('ops.queue.assignTo')}</option>
                                {runners.map((r) => (
                                  <option key={r.id} value={r.id}>{r.full_name}</option>
                                ))}
                              </select>
                            ) : task.runner ? (
                              <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded-full bg-brand-500/20 flex items-center justify-center">
                                  <User size={9} className="text-brand-400" />
                                </div>
                                <span className="text-xs text-brand-400">
                                  {task.runner.full_name}
                                </span>
                              </div>
                            ) : null}

                            {/* View Link */}
                            <Link
                              href={`/ops/tasks/${task.id}` as '/ops/queue'}
                              className="mt-3 flex items-center gap-1 text-xs text-slate-500 hover:text-brand-400 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View details <ChevronRight size={10} />
                            </Link>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
