'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, CalendarDays } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatDate, formatDisplayDate, getMotivationalMessage, calculateDailyScore, getGreeting } from '@/lib/utils';
import { Task } from '@/lib/types';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';
import ProductivityRing from './ProductivityRing';

export default function TodayTimeline() {
  const { state, addTask, updateTask, deleteTask, toggleTask } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const today = formatDate(new Date());

  const todayTasks = useMemo(
    () => state.tasks
      .filter(t => t.date === today)
      .sort((a, b) => {
        // Completed tasks go to bottom
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        return a.order - b.order || a.startTime.localeCompare(b.startTime);
      }),
    [state.tasks, today]
  );

  const dailyScore = useMemo(
    () => calculateDailyScore(state.tasks, today),
    [state.tasks, today]
  );

  const completedCount = todayTasks.filter(t => t.status === 'completed').length;

  function handleSubmit(task: Omit<Task, 'id' | 'createdAt' | 'order'>) {
    if (editingTask) {
      updateTask(editingTask.id, task);
    } else {
      addTask(task);
    }
    setEditingTask(null);
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
    setShowModal(true);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays size={14} className="text-chrono-text-muted" />
              <span className="text-xs text-chrono-text-muted font-medium uppercase tracking-wider">
                {formatDisplayDate(new Date())}
              </span>
            </div>
            <h1 className="text-2xl font-bold gradient-text mb-1">
              {getGreeting()}
            </h1>
            <p className="text-sm text-chrono-text-muted italic">
              &ldquo;{getMotivationalMessage()}&rdquo;
            </p>
          </div>
          <ProductivityRing score={dailyScore} size={90} strokeWidth={6} />
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 text-xs text-chrono-text-secondary">
            <div className="w-2 h-2 rounded-full bg-priority-low" />
            <span>{completedCount}/{todayTasks.length} completed</span>
          </div>
          <div className="h-3 w-px bg-chrono-border" />
          <div className="text-xs text-chrono-text-muted">
            {todayTasks.filter(t => t.status !== 'completed').length} remaining
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-chrono-border/50 mx-6" />

      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-chrono-text-secondary uppercase tracking-wider">
            Today&apos;s Tasks
          </h3>
          <button
            onClick={() => { setEditingTask(null); setShowModal(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                     bg-white/[0.06] hover:bg-white/[0.1] text-chrono-text-secondary hover:text-chrono-text
                     border border-chrono-border/40 hover:border-chrono-border-light
                     transition-all duration-200"
          >
            <Plus size={14} />
            Add Task
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          {todayTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
                <CalendarDays size={24} className="text-chrono-text-muted" />
              </div>
              <p className="text-sm text-chrono-text-muted">No tasks for today</p>
              <p className="text-xs text-chrono-text-muted mt-1">Click &ldquo;Add Task&rdquo; to get started</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task, i) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={i}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AddTaskModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingTask(null); }}
        onSubmit={handleSubmit}
        editTask={editingTask}
      />
    </div>
  );
}
