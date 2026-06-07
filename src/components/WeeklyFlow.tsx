'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Clock, Users } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getWeekDays } from '@/lib/utils';
import { PRIORITY_CONFIG, Priority } from '@/lib/types';

export default function WeeklyFlow() {
  const { state } = useStore();
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const weekDays = useMemo(
    () => getWeekDays(state.tasks),
    [state.tasks]
  );

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col h-full p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-chrono-text-secondary uppercase tracking-wider">
          Weekly Flow
        </h3>
        <span className="text-[10px] text-chrono-text-muted font-medium">This Week</span>
      </div>

      <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
        {weekDays.map((day, i) => {
          const isToday = day.date === todayStr;
          const isExpanded = expandedDay === day.date;
          const hasWork = day.taskCount > 0;

          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {/* Day Row */}
              <button
                onClick={() => setExpandedDay(isExpanded ? null : day.date)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 text-left
                  ${isToday ? 'bg-white/[0.06] border border-chrono-border/50' : 'hover:bg-white/[0.03]'}
                `}
              >
                {/* Day Name */}
                <span className={`
                  text-xs font-bold w-8 flex-shrink-0
                  ${isToday ? 'text-chrono-text' : 'text-chrono-text-muted'}
                `}>
                  {day.dayName}
                </span>

                {/* Progress Bar */}
                <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${day.workloadPercent}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full rounded-full"
                    style={{
                      background: day.workloadPercent > 80
                        ? 'linear-gradient(90deg, #ef4444, #f97316)'
                        : day.workloadPercent > 50
                        ? 'linear-gradient(90deg, #f97316, #eab308)'
                        : day.workloadPercent > 20
                        ? 'linear-gradient(90deg, #eab308, #22c55e)'
                        : 'linear-gradient(90deg, #22c55e, #16a34a)',
                    }}
                  />
                </div>

                {/* Stats */}
                <span className="text-[10px] text-chrono-text-muted w-8 text-right flex-shrink-0">
                  {day.workloadPercent}%
                </span>

                {/* Priority Dots */}
                <div className="flex gap-0.5 flex-shrink-0">
                  {(Object.keys(day.priorityBreakdown) as Priority[]).map(p => {
                    const count = day.priorityBreakdown[p];
                    if (count === 0) return null;
                    return (
                      <div
                        key={p}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: PRIORITY_CONFIG[p].color }}
                        title={`${count} ${PRIORITY_CONFIG[p].label}`}
                      />
                    );
                  })}
                </div>

                {/* Task Count */}
                <span className="text-[10px] text-chrono-text-muted flex-shrink-0">
                  {day.taskCount}
                </span>

                {/* Expand Icon */}
                {hasWork && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={12} className="text-chrono-text-muted" />
                  </motion.div>
                )}
              </button>

              {/* Expanded Tasks */}
              <AnimatePresence>
                {isExpanded && hasWork && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-11 pr-3 py-2 space-y-1.5">
                      {day.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 text-xs py-1"
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: PRIORITY_CONFIG[task.priority].color }}
                          />
                          <span className={`flex-1 truncate ${task.status === 'completed' ? 'text-chrono-text-muted line-through' : 'text-chrono-text-secondary'}`}>
                            {task.title}
                          </span>
                          {task.startTime && (
                            <span className="text-chrono-text-muted flex items-center gap-1">
                              <Clock size={9} />
                              {task.startTime}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
