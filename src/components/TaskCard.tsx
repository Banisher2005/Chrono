'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import { Check, Trash2, Edit3, Clock, GripVertical, MoreVertical, X, Play } from 'lucide-react';
import { Task, PRIORITY_CONFIG, SOURCE_CONFIG } from '@/lib/types';
import { formatTime, getTaskDuration, formatDuration } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface TaskCardProps {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export default function TaskCard({ task, index, onToggle, onDelete, onEdit }: TaskCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const sourceConfig = SOURCE_CONFIG[task.source];
  const duration = getTaskDuration(task.startTime, task.endTime);
  const isCompleted = task.status === 'completed';
  const router = useRouter();
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={task}
      id={task.id}
      dragListener={false}
      dragControls={dragControls}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={`
        group relative rounded-xl border-l-[3px] overflow-hidden
        transition-all duration-200
        ${isCompleted ? 'opacity-60' : ''}
        glass glass-hover
      `}
      style={{ borderLeftColor: priorityConfig.color }}
    >
      <div className="flex items-start gap-3 p-4 relative z-10">
        {/* Drag Handle */}
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="hidden sm:block opacity-0 group-hover:opacity-40 transition-opacity cursor-grab hover:cursor-grabbing pt-0.5 touch-none"
        >
          <GripVertical size={14} />
        </div>

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => onToggle(task.id)}
          className="task-checkbox mt-0.5"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-semibold text-sm leading-tight ${isCompleted ? 'line-through text-chrono-text-muted' : 'text-chrono-text'}`}>
              {task.title}
            </h4>
            <span className="text-xs" title={sourceConfig.label}>{sourceConfig.icon}</span>
          </div>

          {task.description && (
            <p className="text-xs text-chrono-text-muted line-clamp-1 mb-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {task.startTime && (
              <div className="flex items-center gap-1 text-xs text-chrono-text-secondary">
                <Clock size={11} />
                <span>
                  {formatTime(task.startTime)}
                  {task.endTime && ` – ${formatTime(task.endTime)}`}
                </span>
              </div>
            )}
            {duration > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] text-chrono-text-muted">
                {formatDuration(duration)}
              </span>
            )}
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${priorityConfig.color}15`,
                color: priorityConfig.color,
              }}
            >
              {priorityConfig.label}
            </span>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggle(task.id)}
            className="p-1.5 rounded-lg hover:bg-green-500/10 text-chrono-text-muted hover:text-green-400 transition-colors"
            title="Complete"
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-chrono-text-muted hover:text-chrono-text transition-colors"
            title="Edit"
          >
            <Edit3 size={14} />
          </button>
          {!isCompleted && task.source === 'chrono' && (
            <button
              onClick={() => router.push(`/dashboard/focus?taskId=${task.id}`)}
              className="p-1.5 rounded-lg hover:bg-blue-500/10 text-chrono-text-muted hover:text-blue-400 transition-colors"
              title="Start Focus Session"
            >
              <Play size={14} />
            </button>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-chrono-text-muted hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="sm:hidden flex items-center">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-1.5 rounded-lg text-chrono-text-muted hover:text-white hover:bg-white/5 transition-colors"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Mobile Actions Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sm:hidden overflow-hidden bg-white/[0.02] border-t border-white/[0.05]"
          >
            <div className="flex items-center justify-around p-2">
              <button onClick={() => { onToggle(task.id); setShowMobileMenu(false); }} className="flex flex-col items-center gap-1 p-2 text-xs text-chrono-text-muted hover:text-green-400 transition-colors">
                <Check size={16} />
                <span>{isCompleted ? 'Undo' : 'Complete'}</span>
              </button>
              <button onClick={() => { onEdit(task); setShowMobileMenu(false); }} className="flex flex-col items-center gap-1 p-2 text-xs text-chrono-text-muted hover:text-white transition-colors">
                <Edit3 size={16} />
                <span>Edit</span>
              </button>
              {!isCompleted && task.source === 'chrono' && (
                <button onClick={() => { router.push(`/dashboard/focus?taskId=${task.id}`); setShowMobileMenu(false); }} className="flex flex-col items-center gap-1 p-2 text-xs text-chrono-text-muted hover:text-blue-400 transition-colors">
                  <Play size={16} />
                  <span>Focus</span>
                </button>
              )}
              <button onClick={() => { setShowDeleteConfirm(true); setShowMobileMenu(false); }} className="flex flex-col items-center gap-1 p-2 text-xs text-chrono-text-muted hover:text-red-400 transition-colors">
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-chrono-surface/90 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-chrono-surface-3 border border-red-500/20 rounded-xl p-4 shadow-xl w-full max-w-[280px]"
            >
              <h4 className="text-sm font-semibold text-white mb-1">Delete this task?</h4>
              <p className="text-xs text-chrono-text-muted line-clamp-2 mb-4">"{task.title}"</p>
              
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-chrono-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Completion Animation */}
      <AnimatePresence>
        {isCompleted && (
          <>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className="absolute inset-0 bg-green-500/[0.02] origin-left pointer-events-none"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute top-4 left-4 w-6 h-6 rounded-full border-2 border-green-400 pointer-events-none sm:left-12"
            />
          </>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}
