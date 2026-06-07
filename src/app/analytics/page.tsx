'use client';

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Flame, TrendingUp, Clock, Target, Zap, Award } from 'lucide-react';
import { useStore } from '@/lib/store';
import { calculateDailyScore, calculateStreak, getHourlyProductivity, formatDate } from '@/lib/utils';
import { addDays, format, subDays } from 'date-fns';
import ProductivityRing from '@/components/ProductivityRing';

export default function AnalyticsPage() {
  const { state } = useStore();
  const today = formatDate(new Date());

  const dailyScore = useMemo(() => calculateDailyScore(state.tasks, today), [state.tasks, today]);
  const streak = useMemo(() => calculateStreak(state.tasks), [state.tasks]);
  const hourlyProd = useMemo(() => getHourlyProductivity(state.tasks), [state.tasks]);

  // Weekly scores (last 7 days)
  const weeklyScores = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = formatDate(subDays(new Date(), 6 - i));
      return {
        date,
        dayLabel: format(subDays(new Date(), 6 - i), 'EEE'),
        score: calculateDailyScore(state.tasks, date),
      };
    });
  }, [state.tasks]);

  const weeklyAvg = useMemo(
    () => Math.round(weeklyScores.reduce((a, b) => a + b.score, 0) / 7),
    [weeklyScores]
  );

  // Total completed
  const totalCompleted = state.tasks.filter(t => t.status === 'completed').length;
  const totalTasks = state.tasks.length;

  // Most productive hour
  const bestHour = useMemo(() => {
    const maxIdx = hourlyProd.indexOf(Math.max(...hourlyProd));
    return maxIdx;
  }, [hourlyProd]);

  const maxWeeklyScore = Math.max(...weeklyScores.map(s => s.score), 1);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 pb-24 md:pb-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold gradient-text mb-1">Analytics</h1>
          <p className="text-sm text-chrono-text-muted">Your productivity insights at a glance</p>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Target, label: 'Daily Score', value: `${dailyScore}%`, color: '#22c55e' },
            { icon: TrendingUp, label: 'Weekly Avg', value: `${weeklyAvg}%`, color: '#eab308' },
            { icon: Flame, label: 'Current Streak', value: `${streak.current} days`, color: '#f97316' },
            { icon: Award, label: 'Tasks Done', value: `${totalCompleted}/${totalTasks}`, color: '#ef4444' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon size={16} style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-xl font-bold text-chrono-text">{stat.value}</p>
              <p className="text-[10px] text-chrono-text-muted uppercase tracking-wider font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Score Ring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6 flex flex-col items-center"
          >
            <h3 className="text-xs font-semibold text-chrono-text-secondary uppercase tracking-wider mb-6 self-start">
              Today&apos;s Performance
            </h3>
            <ProductivityRing score={dailyScore} size={160} strokeWidth={10} />
            <div className="mt-6 grid grid-cols-2 gap-6 w-full">
              <div className="text-center">
                <p className="text-lg font-bold text-chrono-text">{state.tasks.filter(t => t.date === today && t.status === 'completed').length}</p>
                <p className="text-[10px] text-chrono-text-muted uppercase">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-chrono-text">{state.tasks.filter(t => t.date === today && t.status === 'pending').length}</p>
                <p className="text-[10px] text-chrono-text-muted uppercase">Remaining</p>
              </div>
            </div>
          </motion.div>

          {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-xs font-semibold text-chrono-text-secondary uppercase tracking-wider mb-6">
              Productivity Streak
            </h3>
            <div className="flex items-center justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                className="relative"
              >
                <div className="text-6xl">🔥</div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center"
                >
                  <span className="text-sm font-bold text-orange-400">{streak.current}</span>
                </motion.div>
              </motion.div>
            </div>
            <p className="text-center text-sm text-chrono-text mb-1">
              <span className="font-bold text-chrono-text">{streak.current} day</span>{' '}
              <span className="text-chrono-text-muted">streak!</span>
            </p>
            <p className="text-center text-xs text-chrono-text-muted">
              Longest: {streak.longest} days
            </p>

            {/* Streak Visual */}
            <div className="flex justify-center gap-1 mt-6">
              {Array.from({ length: 14 }, (_, i) => {
                const active = i < streak.current;
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.05 }}
                    className={`w-3 h-3 rounded-sm ${active ? 'bg-orange-500' : 'bg-white/[0.04]'}`}
                  />
                );
              })}
            </div>
          </motion.div>

          {/* Weekly Consistency */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-xs font-semibold text-chrono-text-secondary uppercase tracking-wider mb-6">
              Weekly Consistency
            </h3>
            <div className="flex items-end gap-2 h-32">
              {weeklyScores.map((day, i) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[9px] text-chrono-text-muted font-medium">{day.score}%</span>
                  <div className="w-full bg-white/[0.04] rounded-lg overflow-hidden" style={{ height: '100%' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.score / Math.max(maxWeeklyScore, 1)) * 100}%` }}
                      transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                      className="w-full rounded-lg mt-auto"
                      style={{
                        background: day.score >= 70
                          ? 'linear-gradient(to top, #22c55e, #16a34a)'
                          : day.score >= 40
                          ? 'linear-gradient(to top, #eab308, #ca8a04)'
                          : 'linear-gradient(to top, #ef4444, #dc2626)',
                        marginTop: 'auto',
                      }}
                    />
                  </div>
                  <span className="text-[9px] text-chrono-text-muted">{day.dayLabel}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Most Productive Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-semibold text-chrono-text-secondary uppercase tracking-wider">
                Productive Hours
              </h3>
              <div className="flex items-center gap-1 text-xs text-chrono-text-muted">
                <Clock size={12} />
                <span>Peak: {bestHour > 12 ? bestHour - 12 : bestHour || 12}{bestHour >= 12 ? 'PM' : 'AM'}</span>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-1 h-24">
              {hourlyProd.slice(6, 23).map((val, i) => {
                const hour = i + 6;
                return (
                  <div key={hour} className="flex flex-col items-center gap-1 justify-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(val, 4)}%` }}
                      transition={{ delay: 0.8 + i * 0.03, duration: 0.4 }}
                      className="w-full rounded-sm"
                      style={{
                        backgroundColor: val > 70 ? '#22c55e' : val > 40 ? '#eab308' : val > 0 ? '#f97316' : 'rgba(255,255,255,0.04)',
                      }}
                    />
                    {i % 3 === 0 && (
                      <span className="text-[7px] text-chrono-text-muted">
                        {hour > 12 ? hour - 12 : hour || 12}{hour >= 12 ? 'p' : 'a'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
