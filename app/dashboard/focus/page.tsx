'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Square, SkipForward, Coffee, Brain, Settings, Check, X } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { saveFocusSession } from '@/lib/api/focus';
import { Task } from '@/lib/types';

type Mode = 'work' | 'shortBreak' | 'longBreak';

const WORK_TIME = 25 * 60;
const SHORT_BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;

function FocusContent() {
  const { state, updateTask } = useStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const taskId = searchParams.get('taskId');
  const task = taskId ? state.tasks.find(t => t.id === taskId) : null;

  const [mode, setMode] = useState<Mode>('work');
  
  // Custom Settings
  const [showSettings, setShowSettings] = useState(false);
  const [workTime, setWorkTime] = useState(25 * 60);
  const [shortBreakTime, setShortBreakTime] = useState(5 * 60);
  const [longBreakTime, setLongBreakTime] = useState(15 * 60);

  const [timeLeft, setTimeLeft] = useState(workTime);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);
  
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Sync timeLeft when switching modes or updating settings
  useEffect(() => {
    if (!isActive) {
      if (mode === 'work') setTimeLeft(workTime);
      else if (mode === 'shortBreak') setTimeLeft(shortBreakTime);
      else if (mode === 'longBreak') setTimeLeft(longBreakTime);
    }
  }, [mode, workTime, shortBreakTime, longBreakTime, isActive]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  function handleComplete() {
    setIsActive(false);
    
    if (mode === 'work') {
      const newCycles = cycles + 1;
      setCycles(newCycles);
      
      // Save session if logged in
      if (state.isAuthenticated && state.user) {
        const durationMinutes = Math.floor(workTime / 60);
        saveFocusSession(state.user.id, durationMinutes, task?.id).catch(console.error);
      }

      // If we are focused on a task, prompt completion
      if (task && task.status !== 'completed') {
        setShowCompleteModal(true);
      }

      if (newCycles % 4 === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
    } else {
      switchMode('work');
    }
  }

  function handleMarkTaskComplete() {
    if (task) {
      updateTask(task.id, { status: 'completed', completedAt: new Date().toISOString() });
    }
    setShowCompleteModal(false);
    router.push('/dashboard');
  }

  function switchMode(newMode: Mode) {
    setMode(newMode);
    setIsActive(false);
  }

  function toggleTimer() {
    setIsActive(!isActive);
  }

  function stopTimer() {
    setIsActive(false);
    switchMode(mode);
  }

  function skipTimer() {
    handleComplete();
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    let total = workTime;
    if (mode === 'shortBreak') total = shortBreakTime;
    if (mode === 'longBreak') total = longBreakTime;
    return ((total - timeLeft) / total) * 100;
  };

  const radius = 120;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (getProgress() / 100) * circumference;

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden bg-chrono-bg">
      {/* Background ambient glow based on mode */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <motion.div
          animate={{
            backgroundColor: mode === 'work' ? '#ef4444' : mode === 'shortBreak' ? '#22c55e' : '#3b82f6',
            scale: isActive ? [1, 1.05, 1] : 1,
          }}
          transition={{ duration: 4, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
          className="w-[500px] h-[500px] rounded-full blur-[120px]"
        />
      </div>

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(true)}
        className="absolute top-6 right-6 p-3 rounded-xl bg-white/[0.04] text-chrono-text-muted hover:text-white transition-colors z-20"
      >
        <Settings size={20} />
      </button>

      <div className="z-10 flex flex-col items-center w-full max-w-md px-6">
        {/* Task Target (If selected) */}
        {task && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 px-4 py-2 rounded-xl bg-white/[0.04] border border-chrono-border/30 text-center max-w-sm"
          >
            <span className="text-xs font-semibold text-chrono-text-secondary uppercase tracking-widest block mb-1">Focusing On</span>
            <p className="text-sm text-chrono-text truncate">{task.title}</p>
          </motion.div>
        )}

        {/* Header Tabs */}
        <div className="flex bg-white/[0.04] p-1.5 rounded-2xl mb-12 border border-chrono-border/30 backdrop-blur-md">
          <button
            onClick={() => switchMode('work')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              mode === 'work' ? 'bg-red-500/20 text-red-400' : 'text-chrono-text-muted hover:text-chrono-text'
            }`}
          >
            <span className="flex items-center gap-2"><Brain size={14} /> Focus</span>
          </button>
          <button
            onClick={() => switchMode('shortBreak')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              mode === 'shortBreak' ? 'bg-green-500/20 text-green-400' : 'text-chrono-text-muted hover:text-chrono-text'
            }`}
          >
            <span className="flex items-center gap-2"><Coffee size={14} /> Short Break</span>
          </button>
          <button
            onClick={() => switchMode('longBreak')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              mode === 'longBreak' ? 'bg-blue-500/20 text-blue-400' : 'text-chrono-text-muted hover:text-chrono-text'
            }`}
          >
            Long Break
          </button>
        </div>

        {/* Circular Timer Display */}
        <div className="relative w-72 h-72 flex items-center justify-center mb-12">
          {/* SVG Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 260 260">
            <circle
              cx="130" cy="130" r={radius}
              stroke="currentColor" strokeWidth="4" fill="transparent"
              className="text-chrono-border/30"
            />
            <motion.circle
              cx="130" cy="130" r={radius}
              stroke="currentColor" strokeWidth="6" fill="transparent"
              strokeLinecap="round"
              className={mode === 'work' ? 'text-red-500' : mode === 'shortBreak' ? 'text-green-500' : 'text-blue-500'}
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          
          <div className="flex flex-col items-center">
            <h1 className="text-6xl font-black tracking-tighter text-chrono-text font-mono">
              {formatTime(timeLeft)}
            </h1>
            <p className="text-sm font-medium text-chrono-text-muted uppercase tracking-widest mt-2">
              {mode === 'work' ? 'Stay Focused' : 'Take a breath'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={stopTimer}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.04] text-chrono-text-muted hover:text-chrono-text hover:bg-white/[0.08] transition-colors"
          >
            <Square size={20} fill="currentColor" />
          </button>
          
          <button
            onClick={toggleTimer}
            className={`w-20 h-20 flex items-center justify-center rounded-full transition-all duration-300 shadow-xl
              ${mode === 'work' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 
                mode === 'shortBreak' ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20' : 
                'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'}`}
          >
            {isActive ? <Pause size={32} fill="white" className="text-white" /> : <Play size={32} fill="white" className="text-white ml-1" />}
          </button>
          
          <button
            onClick={skipTimer}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.04] text-chrono-text-muted hover:text-chrono-text hover:bg-white/[0.08] transition-colors"
          >
            <SkipForward size={20} fill="currentColor" />
          </button>
        </div>

        {/* Session Count */}
        <div className="mt-12 flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full transition-colors duration-500 ${
                i < (cycles % 4) ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-white/[0.1]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-chrono-bg/90 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-chrono-surface glass-strong border border-chrono-border/50 rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Timer Settings</h3>
                <button onClick={() => setShowSettings(false)} className="text-chrono-text-muted hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-chrono-text-muted uppercase mb-1 block">Work Duration (min)</label>
                  <input type="number" value={workTime / 60} onChange={(e) => setWorkTime(Number(e.target.value) * 60)} className="w-full bg-white/[0.04] border border-chrono-border/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-red-500" min="1" max="120" />
                </div>
                <div>
                  <label className="text-xs text-chrono-text-muted uppercase mb-1 block">Short Break (min)</label>
                  <input type="number" value={shortBreakTime / 60} onChange={(e) => setShortBreakTime(Number(e.target.value) * 60)} className="w-full bg-white/[0.04] border border-chrono-border/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-green-500" min="1" max="60" />
                </div>
                <div>
                  <label className="text-xs text-chrono-text-muted uppercase mb-1 block">Long Break (min)</label>
                  <input type="number" value={longBreakTime / 60} onChange={(e) => setLongBreakTime(Number(e.target.value) * 60)} className="w-full bg-white/[0.04] border border-chrono-border/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" min="1" max="60" />
                </div>
              </div>

              <button onClick={() => setShowSettings(false)} className="w-full mt-6 bg-white text-black font-semibold rounded-xl py-2.5">
                Save & Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Completion Modal */}
      <AnimatePresence>
        {showCompleteModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-chrono-bg/90 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-chrono-surface glass-strong border border-chrono-border/50 rounded-2xl p-6 w-full max-w-sm text-center"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Great Focus Session!</h3>
              <p className="text-sm text-chrono-text-muted mb-6">Did you finish the task "{task?.title}"?</p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] text-chrono-text-muted hover:text-white transition-colors text-sm font-semibold"
                >
                  Not Yet
                </button>
                <button
                  onClick={handleMarkTaskComplete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-semibold shadow-lg shadow-green-500/20"
                >
                  Mark Complete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FocusPage() {
  return (
    <Suspense fallback={
      <div className="h-full w-full flex items-center justify-center bg-chrono-bg">
        <img src="/branding/chrono-mark.svg" alt="Loading..." className="w-[72px] h-[72px]" />
      </div>
    }>
      <FocusContent />
    </Suspense>
  );
}
