'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { getMonthHeatmapData, getCalendarGridOffset, getIntensityColor, getIntensityLabel, formatDate } from '@/lib/utils';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ChronoGrid() {
  const { state, setSelectedDate } = useStore();
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const heatmapData = useMemo(
    () => getMonthHeatmapData(state.tasks, year, month),
    [state.tasks, year, month]
  );

  const gridOffset = useMemo(() => getCalendarGridOffset(year, month), [year, month]);

  const hoveredDayData = useMemo(
    () => heatmapData.find(d => d.date === hoveredDay),
    [heatmapData, hoveredDay]
  );

  function handleMouseEnter(date: string, event: React.MouseEvent) {
    setHoveredDay(date);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
  }

  function handleDayClick(date: string) {
    setSelectedDate(date);
    router.push('/dashboard');
  }

  return (
    <div className="flex flex-col h-full p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-chrono-text-secondary uppercase tracking-wider">
          Chrono Grid
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 rounded-lg hover:bg-white/[0.06] text-chrono-text-muted hover:text-chrono-text transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs font-medium text-chrono-text-secondary w-24 text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 rounded-lg hover:bg-white/[0.06] text-chrono-text-muted hover:text-chrono-text transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map(day => (
          <div key={day} className="text-[9px] text-chrono-text-muted text-center font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {/* Empty cells for offset */}
        {Array.from({ length: gridOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {heatmapData.map((day, i) => {
          const dateNum = parseInt(day.date.split('-')[2]);
          const isToday = day.date === formatDate(new Date());
          const isSelected = day.date === state.selectedDate;

          return (
            <motion.button
              key={day.date}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.02, duration: 0.3 }}
              onMouseEnter={(e) => handleMouseEnter(day.date, e)}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={() => handleDayClick(day.date)}
              className={`
                heatmap-cell aspect-square rounded-md flex items-center justify-center
                text-[9px] font-medium relative hover:z-10 focus:outline-none
                ${isToday && !isSelected ? 'ring-2 ring-white/20 shadow-[0_0_8px_rgba(255,255,255,0.2)]' : ''}
                ${isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-chrono-bg z-10' : ''}
              `}
              style={{ backgroundColor: getIntensityColor(day.intensity) }}
            >
              <span className={`
                ${day.intensity > 0 ? 'text-white/70' : 'text-chrono-text-muted/50'}
              `}>
                {dateNum}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-chrono-border/30">
        <span className="text-[9px] text-chrono-text-muted">Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(intensity => (
            <div
              key={intensity}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getIntensityColor(intensity) }}
              title={getIntensityLabel(intensity)}
            />
          ))}
        </div>
        <span className="text-[9px] text-chrono-text-muted">More</span>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredDay && hoveredDayData && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="fixed z-50 pointer-events-none"
            style={{ left: tooltipPos.x, top: tooltipPos.y, transform: 'translate(-50%, -100%)' }}
          >
            <div className="glass-strong rounded-xl px-4 py-3 shadow-2xl min-w-[160px]">
              <p className="text-xs font-semibold text-chrono-text mb-2">
                {format(new Date(hoveredDay + 'T00:00:00'), 'MMMM d')}
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-chrono-text-muted">Tasks Completed</span>
                  <span className="text-chrono-text font-medium">
                    {hoveredDayData.tasksCompleted}/{hoveredDayData.tasksTotal}
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-chrono-text-muted">Meetings</span>
                  <span className="text-chrono-text font-medium">{hoveredDayData.meetings}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-chrono-text-muted">Focus Score</span>
                  <span className="text-chrono-text font-medium">{hoveredDayData.focusScore}%</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-chrono-text-muted">Intensity</span>
                  <span className="text-chrono-text font-medium">{getIntensityLabel(hoveredDayData.intensity)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
