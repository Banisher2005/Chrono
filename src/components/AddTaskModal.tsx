'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus } from 'lucide-react';
import { Task, Priority, TaskSource, PRIORITY_CONFIG, CATEGORIES, CATEGORY_LABELS, TaskCategory } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'order'>) => void;
  editTask?: Task | null;
}

export default function AddTaskModal({ isOpen, onClose, onSubmit, editTask }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(formatDate(new Date()));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('Work');
  const [source, setSource] = useState<TaskSource>('chrono');

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description);
      setDate(editTask.date);
      setStartTime(editTask.startTime);
      setEndTime(editTask.endTime);
      setPriority(editTask.priority);
      setCategory(editTask.category);
      setSource(editTask.source);
    } else {
      resetForm();
    }
  }, [editTask, isOpen]);

  function resetForm() {
    setTitle('');
    setDescription('');
    setDate(formatDate(new Date()));
    setStartTime('09:00');
    setEndTime('10:00');
    setPriority('medium');
    setCategory('work');
    setSource('chrono');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      date,
      startTime,
      endTime,
      priority,
      category,
      source,
      status: editTask?.status || 'todo',
      completedAt: editTask?.completedAt,
    });

    resetForm();
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg glass-strong rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-chrono-border/50">
              <h2 className="text-lg font-semibold gradient-text">
                {editTask ? 'Edit Task' : 'New Task'}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-chrono-text-muted hover:text-chrono-text transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-chrono-text-secondary mb-1.5 uppercase tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full px-4 py-2.5 rounded-xl bg-chrono-surface-2 border border-chrono-border/50
                           text-chrono-text placeholder-chrono-text-muted text-sm
                           focus:outline-none focus:border-chrono-border-light transition-colors"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-chrono-text-secondary mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-chrono-surface-2 border border-chrono-border/50
                           text-chrono-text placeholder-chrono-text-muted text-sm resize-none
                           focus:outline-none focus:border-chrono-border-light transition-colors"
                />
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-chrono-text-secondary mb-1.5 uppercase tracking-wider">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-chrono-surface-2 border border-chrono-border/50
                             text-chrono-text text-sm focus:outline-none focus:border-chrono-border-light
                             transition-colors [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-chrono-text-secondary mb-1.5 uppercase tracking-wider">
                    Start
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-chrono-surface-2 border border-chrono-border/50
                             text-chrono-text text-sm focus:outline-none focus:border-chrono-border-light
                             transition-colors [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-chrono-text-secondary mb-1.5 uppercase tracking-wider">
                    End
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-chrono-surface-2 border border-chrono-border/50
                             text-chrono-text text-sm focus:outline-none focus:border-chrono-border-light
                             transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-medium text-chrono-text-secondary mb-2 uppercase tracking-wider">
                  Priority
                </label>
                <div className="flex gap-2">
                  {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`
                        flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200
                        ${priority === p
                          ? 'ring-1 scale-[1.02]'
                          : 'opacity-50 hover:opacity-75'
                        }
                      `}
                      style={{
                        backgroundColor: `${PRIORITY_CONFIG[p].color}15`,
                        color: PRIORITY_CONFIG[p].color,
                        ...(priority === p ? { ringColor: PRIORITY_CONFIG[p].color } : {}),
                        boxShadow: priority === p ? `0 0 0 1px ${PRIORITY_CONFIG[p].color}40` : 'none',
                      }}
                    >
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-chrono-text-secondary mb-1.5 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-chrono-surface-2 border border-chrono-border/50
                           text-chrono-text text-sm focus:outline-none focus:border-chrono-border-light
                           transition-colors appearance-none cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!title.trim()}
                className="w-full py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.12]
                         text-chrono-text font-semibold text-sm
                         border border-chrono-border/50 hover:border-chrono-border-light
                         transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                {editTask ? 'Save Changes' : 'Add Task'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
