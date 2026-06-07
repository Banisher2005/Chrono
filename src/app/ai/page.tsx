'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Calendar, CheckCircle2, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import { addDays, format } from 'date-fns';
import { Priority, Task } from '@/lib/types';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  tasks?: Array<{ title: string; date: string; priority: Priority; description: string; startTime: string; endTime: string }>;
  applied?: boolean;
}

// ─── Rule-based AI Scheduler ────────────────────────────────────

function generateSchedule(prompt: string): Message['tasks'] {
  const lower = prompt.toLowerCase();
  const today = new Date();

  // Detect deadline
  let deadline = 5; // default 5 days
  if (lower.includes('tomorrow')) deadline = 1;
  else if (lower.includes('two days') || lower.includes('2 days')) deadline = 2;
  else if (lower.includes('three days') || lower.includes('3 days')) deadline = 3;
  else if (lower.match(/by (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/)) {
    const dayMap: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    const match = lower.match(/by (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
    if (match) {
      const targetDay = dayMap[match[1]];
      const currentDay = today.getDay();
      deadline = (targetDay - currentDay + 7) % 7 || 7;
    }
  }
  else if (lower.includes('this week')) deadline = Math.max(5 - today.getDay(), 1);

  // Detect project type and generate appropriate subtasks
  let subtasks: Array<{ title: string; priority: Priority; description: string }> = [];

  if (lower.includes('machine learning') || lower.includes('ml') || lower.includes('ai project')) {
    subtasks = [
      { title: 'Research & Literature Review', priority: 'medium', description: 'Review relevant papers and existing approaches' },
      { title: 'Dataset Collection & Preprocessing', priority: 'high', description: 'Gather, clean, and prepare the dataset' },
      { title: 'Model Architecture Design', priority: 'critical', description: 'Design and implement the model architecture' },
      { title: 'Training & Hyperparameter Tuning', priority: 'critical', description: 'Train the model and optimize hyperparameters' },
      { title: 'Evaluation & Testing', priority: 'high', description: 'Evaluate model performance on test set' },
      { title: 'Documentation & Report', priority: 'medium', description: 'Write project documentation and final report' },
      { title: 'Final Review & Submission', priority: 'critical', description: 'Final review, cleanup, and submission' },
    ];
  } else if (lower.includes('presentation') || lower.includes('slides') || lower.includes('pitch')) {
    subtasks = [
      { title: 'Outline & Key Points', priority: 'high', description: 'Define main topics and key messages' },
      { title: 'Content Research', priority: 'medium', description: 'Gather data, stats, and supporting material' },
      { title: 'Slide Design & Creation', priority: 'high', description: 'Design slides with visuals and content' },
      { title: 'Speaker Notes & Script', priority: 'medium', description: 'Write talking points for each slide' },
      { title: 'Practice Run & Refinement', priority: 'critical', description: 'Rehearse and refine the presentation' },
    ];
  } else if (lower.includes('website') || lower.includes('web app') || lower.includes('frontend')) {
    subtasks = [
      { title: 'Requirements & Wireframes', priority: 'high', description: 'Define requirements and create wireframes' },
      { title: 'Design System Setup', priority: 'medium', description: 'Set up colors, typography, and components' },
      { title: 'Core Pages Development', priority: 'critical', description: 'Build the main pages and navigation' },
      { title: 'Interactive Features', priority: 'high', description: 'Implement forms, animations, and interactions' },
      { title: 'Testing & Responsive Design', priority: 'high', description: 'Test across devices and fix issues' },
      { title: 'Deployment & Launch', priority: 'critical', description: 'Deploy to production and verify' },
    ];
  } else if (lower.includes('exam') || lower.includes('study') || lower.includes('test')) {
    subtasks = [
      { title: 'Review Syllabus & Topics', priority: 'medium', description: 'Identify all topics to cover' },
      { title: 'Study Core Concepts', priority: 'critical', description: 'Deep dive into fundamental concepts' },
      { title: 'Practice Problems', priority: 'high', description: 'Solve practice problems and past papers' },
      { title: 'Weak Areas Review', priority: 'critical', description: 'Focus on difficult topics' },
      { title: 'Mock Test & Final Review', priority: 'high', description: 'Take mock test and review mistakes' },
    ];
  } else {
    // Generic project breakdown
    subtasks = [
      { title: 'Research & Planning', priority: 'medium', description: 'Research the topic and create a plan' },
      { title: 'Core Work - Phase 1', priority: 'high', description: 'Start on the main deliverables' },
      { title: 'Core Work - Phase 2', priority: 'critical', description: 'Continue building on Phase 1' },
      { title: 'Review & Refinement', priority: 'high', description: 'Review work and make improvements' },
      { title: 'Final Delivery', priority: 'critical', description: 'Final touches and delivery' },
    ];
  }

  // Distribute tasks across available days
  const tasksPerDay = Math.ceil(subtasks.length / deadline);
  const result: Message['tasks'] = [];

  subtasks.forEach((task, i) => {
    const dayOffset = Math.min(Math.floor(i / tasksPerDay), deadline - 1);
    const date = formatDate(addDays(today, dayOffset + 1));
    const startHour = 9 + (i % tasksPerDay) * 2;

    result.push({
      ...task,
      date,
      startTime: `${startHour.toString().padStart(2, '0')}:00`,
      endTime: `${(startHour + 2).toString().padStart(2, '0')}:00`,
    });
  });

  return result;
}

function generateAIResponse(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('machine learning') || lower.includes('ml')) {
    return "I've analyzed your machine learning project and created an optimized schedule. I've distributed the work to ensure the most complex tasks (model training & architecture) happen mid-week when you'll have maximum focus. Let me know if you'd like to adjust any timelines!";
  }
  if (lower.includes('presentation') || lower.includes('slides')) {
    return "I've broken down your presentation into manageable phases. Starting with research and outlining, building through design, and ending with practice runs. This ensures you're not rushing the rehearsal!";
  }
  if (lower.includes('website') || lower.includes('web app')) {
    return "I've created a development schedule following best practices. We start with planning, move through implementation, and end with testing and deployment. Each phase builds on the previous one.";
  }
  if (lower.includes('exam') || lower.includes('study')) {
    return "I've designed a study schedule that starts with broad review and progressively narrows focus. The final day includes a mock test to build confidence. Spaced repetition is built into the plan!";
  }
  return "I've broken your project into manageable phases spread across the available time. Critical tasks are front-loaded to reduce deadline pressure. Want me to adjust the priority or timeline of any task?";
}

export default function AISchedulerPage() {
  const { addTask } = useStore();
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1500));

    const tasks = generateSchedule(userMsg.content);
    const responseText = generateAIResponse(userMsg.content);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      content: responseText,
      tasks,
      applied: false,
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  }

  function handleApply(msgId: string) {
    const msg = messages.find(m => m.id === msgId);
    if (!msg?.tasks) return;

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
        status: 'pending',
      });
    });

    setMessages(prev =>
      prev.map(m => m.id === msgId ? { ...m, applied: true } : m)
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-chrono-border/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
            <Sparkles size={20} className="text-violet-400" />
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
                    <Sparkles size={12} className="text-violet-400" />
                    <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">Chrono AI</span>
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
                        key={j}
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

                    {/* Apply Button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: msg.tasks.length * 0.1 + 0.2 }}
                      onClick={() => handleApply(msg.id)}
                      disabled={msg.applied}
                      className={`
                        w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2
                        transition-all duration-200 mt-2
                        ${msg.applied
                          ? 'bg-green-500/10 text-green-400 cursor-default'
                          : 'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/30'
                        }
                      `}
                    >
                      {msg.applied ? (
                        <>
                          <CheckCircle2 size={14} />
                          Applied to Timeline
                        </>
                      ) : (
                        <>
                          <Calendar size={14} />
                          Apply Schedule
                        </>
                      )}
                    </motion.button>
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
              <Loader2 size={14} className="animate-spin text-violet-400" />
              <span className="text-xs">Chrono AI is thinking...</span>
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
            className="p-3 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-400
                     border border-violet-500/20 hover:border-violet-500/30
                     transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
