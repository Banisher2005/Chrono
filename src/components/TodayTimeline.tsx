'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { Plus, CalendarDays, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatDate, formatDisplayDate, getMotivationalMessage, calculateDailyScore, getGreeting } from '@/lib/utils';
import { Task } from '@/lib/types';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';
import ProductivityRing from './ProductivityRing';

export default function TodayTimeline() {
  const { state, addTask, updateTask, deleteTask, toggleTask, setSelectedDate, reorderTasks } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const selectedDateObj = new Date(state.selectedDate + 'T00:00:00');
  const isToday = state.selectedDate === formatDate(new Date());

  const dayTasks = useMemo(
    () => state.tasks
      .filter(t => t.date === state.selectedDate)
      .sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        return a.order - b.order || a.startTime.localeCompare(b.startTime);
      }),
    [state.tasks, state.selectedDate]
  );

  const dailyScore = useMemo(
    () => calculateDailyScore(state.tasks, state.selectedDate),
    [state.tasks, state.selectedDate]
  );

  const completedCount = dayTasks.filter(t => t.status === 'completed').length;

  function handlePrevDay() {
    const d = new Date(selectedDateObj);
    d.setDate(d.getDate() - 1);
    setSelectedDate(formatDate(d));
  }

  function handleNextDay() {
    const d = new Date(selectedDateObj);
    d.setDate(d.getDate() + 1);
    setSelectedDate(formatDate(d));
  }

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
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center gap-2">
                <button onClick={handlePrevDay} className="text-chrono-text-muted hover:text-white transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-1.5 min-w-[110px] justify-center">
                  <CalendarDays size={14} className="text-chrono-text-muted" />
                  <span className="text-xs text-chrono-text-muted font-medium uppercase tracking-wider">
                    {formatDisplayDate(selectedDateObj)}
                  </span>
                </div>
                <button onClick={handleNextDay} className="text-chrono-text-muted hover:text-white transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
              {!isToday && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSelectedDate(formatDate(new Date()))}
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] transition-colors"
                >
                  Today
                </motion.button>
              )}
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
            <span>{completedCount}/{dayTasks.length} completed</span>
          </div>
          <div className="h-3 w-px bg-chrono-border" />
          <div className="text-xs text-chrono-text-muted">
            {dayTasks.filter(t => t.status !== 'completed').length} remaining
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-chrono-border/50 mx-6" />

      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-chrono-text-secondary uppercase tracking-wider">
            {isToday ? "Today's Timeline" : `${selectedDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Timeline`}
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
          {dayTasks.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-5">
                <CalendarDays size={24} className="text-chrono-text-muted" />
              </div>
              <p className="text-sm font-medium text-chrono-text mb-1">No missions planned</p>
              <p className="text-xs text-chrono-text-muted max-w-[200px] mb-6">
                Your timeline is clear for {isToday ? 'today' : formatDisplayDate(selectedDateObj)}.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setEditingTask(null); setShowModal(true); }}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-white text-black hover:bg-gray-200 transition-colors"
                >
                  Add Task
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard/ai'}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-violet-500/20 text-violet-400 border border-violet-500/30 hover:bg-violet-500/30 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  Ask AI
                </button>
              </div>
            </motion.div>
          ) : (
            <Reorder.Group 
              axis="y" 
              values={dayTasks} 
              onReorder={(newOrder) => {
                // Ensure external events aren't reordered if they are strictly time-bound,
                // but for simplicity, we pass the new order IDs to the store.
                reorderTasks(state.selectedDate, newOrder.map(t => t.id));
              }} 
              className="space-y-2"
            >
              {dayTasks.map((task, i) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={i}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onEdit={handleEdit}
                />
              ))}
            </Reorder.Group>
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
