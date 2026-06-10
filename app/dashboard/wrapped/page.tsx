'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '@/lib/store';
import { Trophy, Clock, Target, Calendar, Share2, Download, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';

type Theme = 'glass' | 'cyberpunk' | 'spotify';

const THEMES: Record<Theme, { bg: string; card: string; text: string; accent: string; font: string }> = {
  glass: {
    bg: 'bg-[#0a0a0b]',
    card: 'bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
    text: 'text-white',
    accent: 'text-red-400',
    font: 'font-sans'
  },
  cyberpunk: {
    bg: 'bg-[#000502]',
    card: 'bg-[#0a0a0a] border-2 border-[#00ff41] shadow-[0_0_15px_#00ff41]',
    text: 'text-[#00ff41]',
    accent: 'text-[#ff00ff]',
    font: 'font-mono uppercase tracking-widest'
  },
  spotify: {
    bg: 'bg-gradient-to-br from-[#FF0050] to-[#00F0FF]',
    card: 'bg-black/40 backdrop-blur-md shadow-2xl',
    text: 'text-white',
    accent: 'text-[#FFD700]',
    font: 'font-sans font-black tracking-tighter'
  }
};

export default function ChronoWrappedPage() {
  const { state } = useStore();
  const [theme, setTheme] = useState<Theme>('glass');
  const [currentSlide, setCurrentSlide] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const { tasks, user } = state;
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const totalTasks = completedTasks.length;
  
  // Calculate total focus time (estimated) - 1 hour per completed task just for demo if actualMinutes is not there
  const totalFocusMinutes = completedTasks.reduce((acc, task) => acc + (task.actualMinutes || task.estimatedMinutes || 60), 0);
  const focusHours = Math.round(totalFocusMinutes / 60);

  // Group by category to find top category
  const categories: Record<string, number> = {};
  completedTasks.forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + 1;
  });
  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Work';

  const slides = [
    {
      title: "Your Year in Time",
      content: `You logged ${focusHours} hours of deep focus this year. That's top 10% of Chrono users.`,
      icon: Clock,
      stat: `${focusHours} hrs`
    },
    {
      title: "Most Productive Zone",
      content: `Your highest output always happened when tackling ${topCategory} tasks.`,
      icon: Target,
      stat: topCategory
    },
    {
      title: "Unstoppable",
      content: `You hit a peak streak of ${state.stats?.longestStreak || 5} consecutive days of pure productivity.`,
      icon: Trophy,
      stat: `${state.stats?.longestStreak || 5} Days`
    }
  ];

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: null });
    const link = document.createElement('a');
    link.download = `Chrono_Wrapped_${user?.name || 'User'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const activeTheme = THEMES[theme];

  return (
    <div className={`min-h-[calc(100vh-theme(spacing.16))] w-full flex flex-col items-center justify-center p-6 transition-colors duration-500 ${activeTheme.bg}`}>
      
      {/* Theme Selector */}
      <div className="absolute top-24 right-8 flex gap-2 z-50">
        {(Object.keys(THEMES) as Theme[]).map(t => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${theme === t ? 'bg-white text-black' : 'bg-black/50 text-white border border-white/20'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="max-w-md w-full relative">
        {/* The Card */}
        <div 
          ref={cardRef}
          className={`relative w-full aspect-[4/5] rounded-[2rem] p-10 flex flex-col justify-between overflow-hidden transition-all duration-500 ${activeTheme.card} ${activeTheme.font}`}
        >
          {/* Header */}
          <div className="flex justify-between items-start z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className={activeTheme.accent} />
                <span className={`text-xs font-bold uppercase tracking-widest ${activeTheme.text} opacity-70`}>Chrono Wrapped</span>
              </div>
              <div className={`text-sm ${activeTheme.text} opacity-50`}>2026</div>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden bg-white/10">
              {user?.avatar ? <img src={user.avatar} alt="User" /> : <div className="w-full h-full flex items-center justify-center text-white font-bold">{user?.name?.[0] || 'U'}</div>}
            </div>
          </div>

          {/* Main Content Carousel */}
          <div className="flex-1 flex flex-col justify-center relative z-10 my-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -20 }}
                transition={{ duration: 0.5, ease: "backOut" }}
                className="text-center flex flex-col items-center"
              >
                {React.createElement(slides[currentSlide].icon, { 
                  size: 64, 
                  className: `mb-8 ${activeTheme.accent}` 
                })}
                <div className={`text-5xl mb-6 leading-none ${theme === 'spotify' ? 'font-black' : 'font-bold'} ${activeTheme.text}`}>
                  {slides[currentSlide].stat}
                </div>
                <h2 className={`text-2xl mb-4 ${activeTheme.text} font-semibold`}>
                  {slides[currentSlide].title}
                </h2>
                <p className={`${activeTheme.text} opacity-70 leading-relaxed max-w-[80%]`}>
                  {slides[currentSlide].content}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="flex justify-between items-end z-10">
            <div className={`text-xs ${activeTheme.text} opacity-50`}>
              chronos-os.com
            </div>
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all ${currentSlide === i ? `bg-white scale-125` : 'bg-white/20'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons (Not included in screenshot) */}
        <div className="mt-8 flex gap-4 justify-center">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold hover:scale-105 transition-transform"
          >
            <Download size={18} /> Save Image
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-bold border border-white/20 hover:bg-white/20 transition-all">
            <Share2 size={18} /> Share
          </button>
        </div>
      </div>

    </div>
  );
}
