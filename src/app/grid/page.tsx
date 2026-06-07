'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, subMonths, format } from 'date-fns';
import { useStore } from '@/lib/store';
import { getMonthHeatmapData, getCalendarGridOffset, getIntensityColor, getIntensityLabel } from '@/lib/utils';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function GridPage() {
  const { state } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const heatmapData = useMemo(
    () => getMonthHeatmapData(state.tasks, year, month),
    [state.tasks, year, month]
  );

  const gridOffset = useMemo(() => getCalendarGridOffset(year, month), [year, month]);

  const selectedDayData = useMemo(
    () => heatmapData.find(d => d.date === selectedDay),
    [heatmapData, selectedDay]
  );

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 pb-24 md:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold gradient-text mb-1">Chrono Grid</h1>
            <p className="text-sm text-chrono-text-muted">Your productivity heatmap</p>
          </div>
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
        </div>

        {/* Day Labels */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {DAY_LABELS.map(day => (
            <div key={day} className="text-xs text-chrono-text-muted text-center font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Offset cells */}
          {Array.from({ length: gridOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {heatmapData.map((day, i) => {
            const dateNum = parseInt(day.date.split('-')[2]);
            const isToday = day.date === todayStr;
            const isSelected = day.date === selectedDay;

            return (
              <motion.button
                key={day.date}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.015, duration: 0.3 }}
                onClick={() => setSelectedDay(isSelected ? null : day.date)}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5
                  transition-all duration-200 cursor-pointer relative
                  ${isSelected ? 'ring-2 ring-white/20 scale-110 z-10' : 'hover:scale-105'}
                  ${isToday ? 'ring-1 ring-chrono-text/20' : ''}
                `}
                style={{ backgroundColor: getIntensityColor(day.intensity) }}
              >
                <span className={`text-sm font-semibold ${day.intensity > 0 ? 'text-white/80' : 'text-chrono-text-muted/60'}`}>
                  {dateNum}
                </span>
                {day.tasksTotal > 0 && (
                  <span className={`text-[8px] ${day.intensity > 0 ? 'text-white/50' : 'text-chrono-text-muted/40'}`}>
                    {day.tasksCompleted}/{day.tasksTotal}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <span className="text-xs text-chrono-text-muted">Less</span>
          {[0, 1, 2, 3, 4].map(intensity => (
            <div
              key={intensity}
              className="w-5 h-5 rounded-md"
              style={{ backgroundColor: getIntensityColor(intensity) }}
              title={getIntensityLabel(intensity)}
            />
          ))}
          <span className="text-xs text-chrono-text-muted">More</span>
        </div>

        {/* Selected Day Detail */}
        {selectedDay && selectedDayData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-chrono-text mb-4">
              {format(new Date(selectedDay + 'T00:00:00'), 'EEEE, MMMM d')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-chrono-text">
                  {selectedDayData.tasksCompleted}/{selectedDayData.tasksTotal}
                </p>
                <p className="text-xs text-chrono-text-muted mt-1">Tasks Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-chrono-text">{selectedDayData.meetings}</p>
                <p className="text-xs text-chrono-text-muted mt-1">Meetings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-chrono-text">{selectedDayData.focusScore}%</p>
                <p className="text-xs text-chrono-text-muted mt-1">Focus Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: getIntensityColor(selectedDayData.intensity) }}>
                  {getIntensityLabel(selectedDayData.intensity)}
                </p>
                <p className="text-xs text-chrono-text-muted mt-1">Intensity</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
