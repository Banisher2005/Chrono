'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Calendar, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import { addDays, format } from 'date-fns';
import { Priority, Task } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  tasks?: Array<{ title: string; date: string; priority: Priority; description: string; startTime: string; endTime: string }>;
  deletedTaskIds?: string[];
  updatedTasks?: Partial<Task>[];
  applied?: boolean;
  rejected?: boolean;
}

import { saveAIMessage } from '@/lib/api/ai-history';

// ─── AI Scheduler ────────────────────────────────────

export default function AISchedulerPage() {
  const { state, addTask, updateTask, deleteTask } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: "Hi! I'm **Chrono AI**, your intelligent scheduling assistant. Tell me about a project or goal, and I'll break it down into an optimal schedule. Try something like:\n\n• \"I need to finish my machine learning project by Friday\"\n• \"Help me prepare a presentation for next week\"\n• \"I have an exam in 3 days\"",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // We need to keep a ref to ensure we only auto-send once per query param
  const hasAutoSent = useRef(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !hasAutoSent.current) {
      hasAutoSent.current = true;
      handleSend(q);
    }
  }, [searchParams]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(overrideInput?: string) {
    const textToSend = overrideInput || input.trim();
    if (!textToSend || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Clean up URL if we used the q param
    if (searchParams.get('q')) {
      window.history.replaceState({}, '', '/dashboard/ai');
    }

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg.content,
          existingTasks: state.tasks,
          userTimezone: timezone,
        })
      });

      if (!res.ok) throw new Error('AI request failed');

      const data = await res.json();
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.message,
        tasks: data.tasks || [],
        deletedTaskIds: data.deletedTaskIds || [],
        updatedTasks: data.updatedTasks || [],
        applied: false,
        rejected: false,
      };

      setMessages(prev => [...prev, aiMsg]);

      // Save to history in background if user is logged in
      if (state.isAuthenticated && state.user) {
        saveAIMessage(state.user.id, userMsg.content, JSON.stringify(data)).catch(console.error);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "I'm sorry, I'm having trouble connecting to my neural network. Please make sure your Gemini API key is configured correctly in `.env.local`.",
      }]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleApply(msgId: string) {
    const msg = messages.find(m => m.id === msgId);
    if (!msg || (!msg.tasks?.length && !msg.deletedTaskIds?.length && !msg.updatedTasks?.length)) return;

    if (msg.tasks) {
      msg.tasks.forEach(task => {
        addTask({
          title: task.title,
          description: task.description,
          date: task.date,
          startTime: task.startTime,
          endTime: task.endTime,
          priority: task.priority,
          category: 'Work',
          source: 'chrono',
          status: 'todo',
        });
      });
    }

    if (msg.deletedTaskIds) {
      msg.deletedTaskIds.forEach(id => deleteTask(id));
    }

    if (msg.updatedTasks) {
      msg.updatedTasks.forEach(updates => {
        if (updates.id) updateTask(updates.id, updates);
      });
    }

    setMessages(prev =>
      prev.map(m => m.id === msgId ? { ...m, applied: true } : m)
    );
  }

  function handleReject(msgId: string) {
    setMessages(prev =>
      prev.map(m => m.id === msgId ? { ...m, rejected: true } : m)
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-chrono-border/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-600/20 flex items-center justify-center">
            <Sparkles size={20} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">Chrono AI</h1>
            <p className="text-[11px] text-chrono-text-muted">Intelligent scheduling assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3
                ${msg.role === 'user'
                  ? 'bg-white/[0.08] border border-chrono-border/40'
                  : 'glass'
                }
              `}>
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={12} className="text-red-400" />
                    <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">Chrono AI</span>
                  </div>
                )}
                <div className="text-sm text-chrono-text-secondary whitespace-pre-wrap leading-relaxed">
                  {msg.content.split('**').map((part, i) =>
                    i % 2 === 0 ? part : <strong key={i} className="text-chrono-text">{part}</strong>
                  )}
                </div>

                {/* Generated Tasks */}
                {msg.tasks && msg.tasks.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="h-px bg-chrono-border/30" />
                    <p className="text-[10px] text-chrono-text-muted uppercase tracking-wider font-semibold flex items-center gap-1">
                      <Calendar size={10} />
                      Generated Schedule
                    </p>
                    {msg.tasks.map((task, j) => (
                      <motion.div
                        key={`add-${j}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: j * 0.1 }}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03]"
                      >
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: task.priority === 'critical' ? '#ef4444'
                              : task.priority === 'high' ? '#f97316'
                              : task.priority === 'medium' ? '#eab308' : '#22c55e'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-chrono-text truncate">{task.title}</p>
                          <p className="text-[10px] text-chrono-text-muted">
                            {format(new Date(task.date + 'T00:00:00'), 'EEE, MMM d')} • {task.startTime} - {task.endTime}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Deleted Tasks */}
                {msg.deletedTaskIds && msg.deletedTaskIds.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="h-px bg-chrono-border/30" />
                    <p className="text-[10px] text-red-400/80 uppercase tracking-wider font-semibold flex items-center gap-1">
                      <Trash2 size={10} />
                      Tasks to Remove
                    </p>
                    {msg.deletedTaskIds.map((id, j) => {
                      const t = state.tasks.find(t => t.id === id);
                      if (!t) return null;
                      return (
                        <motion.div
                          key={`del-${id}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: j * 0.1 }}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-red-400 line-through truncate">{t.title}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Updated Tasks */}
                {msg.updatedTasks && msg.updatedTasks.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="h-px bg-chrono-border/30" />
                    <p className="text-[10px] text-orange-400/80 uppercase tracking-wider font-semibold flex items-center gap-1">
                      <Sparkles size={10} />
                      Tasks to Update
                    </p>
                    {msg.updatedTasks.map((updates, j) => {
                      const t = state.tasks.find(t => t.id === updates.id);
                      if (!t) return null;
                      return (
                        <motion.div
                          key={`upd-${updates.id}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: j * 0.1 }}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-orange-400 truncate">Moving: {t.title}</p>
                            <p className="text-[10px] text-orange-400/60">
                              {updates.date || t.date} • {updates.startTime || t.startTime} - {updates.endTime || t.endTime}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Apply Button */}
                {((msg.tasks && msg.tasks.length > 0) || (msg.deletedTaskIds && msg.deletedTaskIds.length > 0) || (msg.updatedTasks && msg.updatedTasks.length > 0)) && !msg.rejected && (
                  <div className="mt-4 flex gap-2">
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (msg.tasks?.length ?? 0) * 0.1 + 0.2 }}
                      onClick={() => handleApply(msg.id)}
                      disabled={msg.applied}
                      className={`
                        flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2
                        transition-all duration-200 mt-2
                        ${msg.applied
                          ? 'bg-green-500/10 text-green-400 cursor-default'
                          : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30'
                        }
                      `}
                    >
                      {msg.applied ? (
                        <>
                          <CheckCircle2 size={14} />
                          Changes Accepted
                        </>
                      ) : (
                        <>
                          <Calendar size={14} />
                          Accept Changes
                        </>
                      )}
                    </motion.button>
                    {!msg.applied && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: (msg.tasks?.length ?? 0) * 0.1 + 0.3 }}
                        onClick={() => handleReject(msg.id)}
                        className="py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] transition-all duration-200 mt-2 text-white/50 hover:text-white"
                      >
                        Reject
                      </motion.button>
                    )}
                  </div>
                )}
                {msg.rejected && (
                  <div className="mt-4 text-center text-xs text-chrono-text-muted italic">
                    Changes rejected.
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-chrono-text-muted"
          >
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-red-400" />
              <span className="text-xs">Chrono AI is analyzing your timeline...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-chrono-border/30">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell Chrono AI about your project or goal..."
            className="flex-1 px-4 py-3 rounded-xl bg-chrono-surface-2 border border-chrono-border/50
                     text-chrono-text placeholder-chrono-text-muted text-sm
                     focus:outline-none focus:border-chrono-border-light transition-colors"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400
                     border border-red-500/20 hover:border-red-500/30
                     transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
