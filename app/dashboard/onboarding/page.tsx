'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, User, Briefcase, Dumbbell, Code, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

export default function OnboardingPage() {
  const router = useRouter();
  const { addTask, state } = useStore();
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    context: '',
    style: '',
    focusTime: '',
  });

  const handleNext = () => setStep(s => s + 1);

  const completeOnboarding = () => {
    localStorage.setItem(`chrono_onboarded_${state.user?.id || 'guest'}`, 'true');
    
    // Generate starter workspace
    const today = new Date().toISOString().split('T')[0];
    
    // Dispatch dummy tasks based on selection
    addTask({
      title: `Plan ${selections.context || 'my week'}`,
      description: 'Take 15 minutes to organize priorities.',
      date: today,
      startTime: '09:00',
      endTime: '09:15',
      priority: 'high',
      category: 'Personal', // Needs to be capitalized matching Category type
      status: 'todo',
      source: 'chrono'
    });

    addTask({
      title: 'Deep Work Session',
      description: `Dedicated time for high-value tasks (${selections.focusTime || 'Afternoon'}).`,
      date: today,
      startTime: '14:00',
      endTime: '16:00',
      priority: 'critical',
      category: 'Work', // Needs to be capitalized matching Category type
      status: 'todo',
      source: 'chrono'
    });

    router.push('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-chrono-bg flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md w-full text-center"
          >
            <div className="mb-8 w-[72px] h-[72px] mx-auto flex items-center justify-center">
              <img src="/branding/chrono-mark.svg" alt="Chrono" className="w-[72px] h-[72px]" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Welcome to Chrono</h1>
            <p className="text-chrono-text-muted text-lg mb-12">Let's build your time system.</p>
            <button
              onClick={handleNext}
              className="w-full py-4 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl w-full"
          >
            <h2 className="text-3xl font-bold mb-2 text-center">What do you manage?</h2>
            <p className="text-chrono-text-muted text-center mb-10">This helps Chrono AI understand your context.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
              {[
                { id: 'college', icon: User, label: 'College' },
                { id: 'work', icon: Briefcase, label: 'Work' },
                { id: 'startup', icon: Sparkles, label: 'Startup' },
                { id: 'fitness', icon: Dumbbell, label: 'Fitness' },
                { id: 'personal', icon: CheckCircle2, label: 'Personal Goals' },
                { id: 'projects', icon: Code, label: 'Projects' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelections(s => ({ ...s, context: opt.id }))}
                  className={`
                    p-6 rounded-2xl border transition-all flex flex-col items-center gap-4
                    ${selections.context === opt.id 
                      ? 'bg-red-500/10 border-red-500 text-white' 
                      : 'bg-chrono-surface border-chrono-border hover:border-chrono-border-light text-chrono-text-muted hover:text-white'
                    }
                  `}
                >
                  <opt.icon size={28} />
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(s => s - 1)} className="px-6 py-3 text-chrono-text-muted hover:text-white">Back</button>
              <button 
                disabled={!selections.context}
                onClick={handleNext}
                className="px-8 py-3 rounded-xl bg-white text-black font-semibold disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-md w-full"
          >
            <h2 className="text-3xl font-bold mb-2 text-center">Choose your style</h2>
            <p className="text-chrono-text-muted text-center mb-10">How do you prefer to work?</p>
            
            <div className="space-y-3 mb-10">
              {[
                { id: 'relaxed', label: 'Relaxed', desc: 'Loose structure, plenty of breaks' },
                { id: 'balanced', label: 'Balanced', desc: 'Structured but flexible' },
                { id: 'high_performance', label: 'High Performance', desc: 'Optimized for maximum output' },
                { id: 'chaos', label: 'Chaos Mode', desc: 'Embrace the mess, just get it done' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelections(s => ({ ...s, style: opt.id }))}
                  className={`
                    w-full text-left p-5 rounded-2xl border transition-all
                    ${selections.style === opt.id 
                      ? 'bg-red-500/10 border-red-500 text-white' 
                      : 'bg-chrono-surface border-chrono-border hover:border-chrono-border-light text-chrono-text-muted hover:text-white'
                    }
                  `}
                >
                  <div className="font-semibold mb-1">{opt.label}</div>
                  <div className="text-sm opacity-70">{opt.desc}</div>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(s => s - 1)} className="px-6 py-3 text-chrono-text-muted hover:text-white">Back</button>
              <button 
                disabled={!selections.style}
                onClick={handleNext}
                className="px-8 py-3 rounded-xl bg-white text-black font-semibold disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-md w-full"
          >
            <h2 className="text-3xl font-bold mb-2 text-center">When do you focus best?</h2>
            <p className="text-chrono-text-muted text-center mb-10">We'll schedule your deep work sessions here.</p>
            
            <div className="space-y-3 mb-10">
              {['Morning', 'Afternoon', 'Night'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setSelections(s => ({ ...s, focusTime: opt }))}
                  className={`
                    w-full text-left p-5 rounded-2xl border transition-all font-medium
                    ${selections.focusTime === opt 
                      ? 'bg-red-500/10 border-red-500 text-white' 
                      : 'bg-chrono-surface border-chrono-border hover:border-chrono-border-light text-chrono-text-muted hover:text-white'
                    }
                  `}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(s => s - 1)} className="px-6 py-3 text-chrono-text-muted hover:text-white">Back</button>
              <button 
                disabled={!selections.focusTime}
                onClick={completeOnboarding}
                className="px-8 py-3 rounded-xl bg-white text-black font-semibold disabled:opacity-50"
              >
                Generate Workspace
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
