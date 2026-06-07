'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { addMonths, subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { useStore } from '@/lib/store';
import { formatDate, formatTime, getTaskDuration, formatDuration } from '@/lib/utils';
import { Task, PRIORITY_CONFIG } from '@/lib/types';
import AddTaskModal from '@/components/AddTaskModal';
import TaskCard from '@/components/TaskCard';

export default function CalendarPage() {
  const { state, addTask, updateTask, toggleTask, deleteTask, setSelectedDate } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date((state.selectedDate || new Date().toISOString().split('T')[0]) + 'T00:00:00'));
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);
  const offset = startDay === 0 ? 6 : startDay - 1;

  const todayStr = formatDate(new Date());

  const selectedTasks = useMemo(
    () => state.tasks
      .filter(t => t.date === state.selectedDate)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')),
    [state.tasks, state.selectedDate]
  );

  const tasksByDate = useMemo(() => {
    const map: Record<string, number> = {};
    state.tasks.forEach(t => {
      map[t.date] = (map[t.date] || 0) + 1;
    });
    return map;
  }, [state.tasks]);

  function handleSubmit(task: Omit<Task, 'id' | 'createdAt' | 'order'>) {
    if (editingTask) {
      updateTask(editingTask.id, task);
    } else {
      addTask({ ...task, date: state.selectedDate });
    }
    setEditingTask(null);
  }

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden">
      {/* Calendar Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Month Nav */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold gradient-text">Calendar</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-xl hover:bg-white/[0.06] text-chrono-text-muted hover:text-chrono-text transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-semibold text-chrono-text min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-xl hover:bg-white/[0.06] text-chrono-text-muted hover:text-chrono-text transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <button
            onClick={() => {
              setSelectedDate(todayStr);
              setCurrentMonth(new Date());
            }}
            className="hidden sm:flex px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] transition-colors"
          >
            Jump to Today
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="text-xs text-chrono-text-muted text-center font-medium py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}
          {days.map((day, i) => {
            const dateStr = formatDate(day);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === state.selectedDate;
            const taskCount = tasksByDate[dateStr] || 0;

            return (
              <motion.button
                key={dateStr}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.01 }}
                onClick={() => setSelectedDate(dateStr)}
                className={`
                  relative aspect-square rounded-xl flex flex-col items-center justify-center gap-1
                  transition-all duration-200 text-sm
                  ${isSelected ? 'bg-white/[0.08] border border-chrono-border/60 shadow-lg' : 'hover:bg-white/[0.04]'}
                  ${isToday ? 'font-bold text-chrono-text' : 'text-chrono-text-secondary'}
                `}
              >
                <span>{format(day, 'd')}</span>
                {taskCount > 0 && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.min(taskCount, 3) }).map((_, j) => (
                      <div key={j} className="w-1 h-1 rounded-full bg-violet-400" />
                    ))}
                  </div>
                )}
                {isToday && !isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-priority-critical" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail */}
      <div className="w-full md:w-[360px] border-t md:border-t-0 md:border-l border-chrono-border/30 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-chrono-border/30">
          <div>
            <p className="text-sm font-semibold text-chrono-text">
              {format(new Date(state.selectedDate + 'T00:00:00'), 'EEEE')}
            </p>
            <p className="text-xs text-chrono-text-muted">
              {format(new Date(state.selectedDate + 'T00:00:00'), 'MMMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={() => { setEditingTask(null); setShowModal(true); }}
            className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-chrono-text-secondary hover:text-chrono-text
                     border border-chrono-border/40 transition-all"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {selectedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-chrono-text-muted">No tasks on this day</p>
              <p className="text-xs text-chrono-text-muted mt-1">Click + to add one</p>
            </div>
          ) : (
            selectedTasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onEdit={(t) => { setEditingTask(t); setShowModal(true); }}
              />
            ))
          )}
        </div>
      </div>

      <AddTaskModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingTask(null); }}
        onSubmit={handleSubmit}
        editTask={editingTask}
      />
    </div>
  );
}
