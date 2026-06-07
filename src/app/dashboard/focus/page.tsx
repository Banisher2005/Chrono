'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Square, SkipForward, Coffee, Brain } from 'lucide-react';

import { useStore } from '@/lib/store';
import { saveFocusSession } from '@/lib/api/focus';

type Mode = 'work' | 'shortBreak' | 'longBreak';

const WORK_TIME = 25 * 60;
const SHORT_BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;

export default function FocusPage() {
  const { state } = useStore();
  const [mode, setMode] = useState<Mode>('work');
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);

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
        saveFocusSession(state.user.id, 25).catch(console.error);
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

  function switchMode(newMode: Mode) {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'work') setTimeLeft(WORK_TIME);
    else if (newMode === 'shortBreak') setTimeLeft(SHORT_BREAK_TIME);
    else if (newMode === 'longBreak') setTimeLeft(LONG_BREAK_TIME);
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
    let total = WORK_TIME;
    if (mode === 'shortBreak') total = SHORT_BREAK_TIME;
    if (mode === 'longBreak') total = LONG_BREAK_TIME;
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

      <div className="z-10 flex flex-col items-center w-full max-w-md px-6">
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
    </div>
  );
}
