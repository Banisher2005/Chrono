'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Check, Trash2, Edit3, Clock, GripVertical } from 'lucide-react';
import { Task, PRIORITY_CONFIG, SOURCE_CONFIG } from '@/lib/types';
import { formatTime, getTaskDuration, formatDuration } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export default function TaskCard({ task, index, onToggle, onDelete, onEdit }: TaskCardProps) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const sourceConfig = SOURCE_CONFIG[task.source];
  const duration = getTaskDuration(task.startTime, task.endTime);
  const isCompleted = task.status === 'completed';

  return (
    <motion.div
      layout
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
      <div className="flex items-start gap-3 p-4">
        {/* Drag Handle */}
        <div className="opacity-0 group-hover:opacity-40 transition-opacity cursor-grab pt-0.5">
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

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-chrono-text-muted hover:text-chrono-text transition-colors"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-chrono-text-muted hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Completion animation overlay */}
      {isCompleted && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="absolute inset-0 bg-green-500/[0.03] origin-left pointer-events-none"
        />
      )}
    </motion.div>
  );
}
