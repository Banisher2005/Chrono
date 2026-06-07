'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Calendar, CheckSquare, Settings, Sparkles, Timer, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function CommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { state } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const actions = [
    { id: 'home', label: 'Go to Dashboard', icon: <Calendar size={16} />, type: 'nav', action: () => router.push('/dashboard') },
    { id: 'ai', label: 'Open Chrono AI', icon: <Sparkles size={16} />, type: 'nav', action: () => router.push('/dashboard/ai') },
    { id: 'focus', label: 'Start Focus Mode', icon: <Timer size={16} />, type: 'action', action: () => router.push('/dashboard/focus') },
    { id: 'settings', label: 'Open Settings', icon: <Settings size={16} />, type: 'nav', action: () => router.push('/dashboard/settings') },
  ];

  // Fuzzy search on actions and tasks
  const filteredActions = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTasks = state.tasks
    .filter((t) => t.status !== 'completed' && t.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  const results = [
    ...(filteredActions.length > 0 ? [{ type: 'header', label: 'Actions' }, ...filteredActions] : []),
    ...(filteredTasks.length > 0 ? [{ type: 'header', label: 'Tasks' }, ...filteredTasks.map(t => ({ id: t.id, label: t.title, icon: <CheckSquare size={16} />, type: 'task', action: () => setIsOpen(false) }))] : []),
  ];

  const selectableResults = results.filter(r => r.type !== 'header');

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % selectableResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + selectableResults.length) % selectableResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = selectableResults[selectedIndex];
      if (selected && 'action' in selected && typeof selected.action === 'function') {
        selected.action();
        setIsOpen(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 modal-overlay"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl glass-strong rounded-2xl overflow-hidden shadow-2xl border border-chrono-border/50 flex flex-col"
          >
            <div className="flex items-center px-4 py-3 border-b border-chrono-border/30 bg-white/[0.02]">
              <Search size={20} className="text-chrono-text-muted mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search tasks, jump to pages, or start a timer..."
                className="flex-1 bg-transparent text-chrono-text placeholder-chrono-text-muted focus:outline-none text-base"
              />
              <div className="text-[10px] text-chrono-text-muted bg-white/[0.08] px-2 py-1 rounded border border-chrono-border/50">
                ESC
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto py-2">
              {results.length === 0 ? (
                <div className="px-6 py-8 text-center text-chrono-text-muted text-sm">
                  No results found for "{query}"
                </div>
              ) : (
                results.map((item, index) => {
                  if (item.type === 'header') {
                    return (
                      <div key={`header-${item.label}`} className="px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-chrono-text-muted">
                        {item.label}
                      </div>
                    );
                  }

                  const selectableIndex = selectableResults.findIndex(r => 'id' in r && 'id' in item && r.id === item.id);
                  const isSelected = selectableIndex === selectedIndex;

                  return (
                    <div
                      key={'id' in item ? item.id : item.label}
                      onClick={() => {
                        if ('action' in item && typeof item.action === 'function') {
                          item.action();
                          setIsOpen(false);
                        }
                      }}
                      onMouseEnter={() => setSelectedIndex(selectableIndex)}
                      className={`
                        flex items-center justify-between px-4 py-3 mx-2 rounded-xl cursor-pointer
                        transition-colors duration-150
                        ${isSelected ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20' : 'text-chrono-text hover:bg-white/[0.04] border border-transparent'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${isSelected ? 'text-violet-400' : 'text-chrono-text-muted'}`}>
                          {'icon' in item ? item.icon : null}
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-1 text-[10px] text-chrono-text-muted">
                          <CornerDownLeft size={12} />
                          <span>Jump</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-4 py-3 border-t border-chrono-border/30 bg-white/[0.01] flex items-center gap-4 text-[10px] text-chrono-text-muted">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-chrono-border/30">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-chrono-border/30">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-chrono-border/30">Enter</kbd>
                to select
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
