'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BarChart3, Calendar, Grid3X3, Sparkles, Timer, Shield } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Grid3X3,
    title: 'Chrono Grid',
    description: 'Visualize your productivity with a GitHub-style heatmap. See your entire year at a glance.',
    gradient: 'from-green-500/20 to-emerald-600/20',
    iconColor: 'text-green-400',
  },
  {
    icon: Sparkles,
    title: 'AI Scheduler',
    description: 'Tell Chrono AI about your project and get an intelligent, optimized schedule in seconds.',
    gradient: 'from-violet-500/20 to-purple-600/20',
    iconColor: 'text-violet-400',
  },
  {
    icon: Calendar,
    title: 'Calendar Sync',
    description: 'Two-way sync with Google Calendar and Microsoft Teams. One unified timeline.',
    gradient: 'from-blue-500/20 to-cyan-600/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description: 'Track your Chrono Score, streaks, focus time, and most productive hours.',
    gradient: 'from-orange-500/20 to-red-600/20',
    iconColor: 'text-orange-400',
  },
  {
    icon: Timer,
    title: 'Focus Mode',
    description: 'Pomodoro-powered deep work sessions. Eliminate distractions and build momentum.',
    gradient: 'from-rose-500/20 to-pink-600/20',
    iconColor: 'text-rose-400',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is encrypted and isolated. Only you can access your time operating system.',
    gradient: 'from-teal-500/20 to-cyan-600/20',
    iconColor: 'text-teal-400',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-chrono-bg text-chrono-text overflow-y-auto">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-chrono-bg/80 border-b border-chrono-border/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
              <div className="w-6 h-6 rounded-full border-2 border-chrono-text/80" />
              <div className="absolute w-2 h-2 rounded-full bg-priority-critical animate-orbit" />
            </div>
            <span className="text-lg font-bold tracking-tight">Chrono</span>
          </div>
          <Link
            href="/login"
            className="px-5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-chrono-border/50
                     text-sm font-medium transition-all duration-200 hover:border-chrono-border-light"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-chrono-border/40 text-xs text-chrono-text-muted mb-8">
              <Sparkles size={12} className="text-violet-400" />
              Powered by Google Gemini AI
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              <span className="gradient-text">Your Time.</span>
              <br />
              <span className="text-chrono-text-muted">Visualized.</span>
            </h1>

            <p className="text-lg md:text-xl text-chrono-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              Chrono is your personal time operating system. Plan intelligently, track consistently,
              and optimize relentlessly — all in one beautiful dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl
                         bg-gradient-to-r from-white/[0.12] to-white/[0.06]
                         hover:from-white/[0.16] hover:to-white/[0.1]
                         border border-chrono-border/60 hover:border-chrono-border-light
                         text-sm font-semibold transition-all duration-300 group"
              >
                Start Planning
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-chrono-bg via-transparent to-transparent z-10 pointer-events-none" />
            <div className="glass rounded-3xl p-1 border border-chrono-border/40">
              <div className="rounded-2xl bg-chrono-surface overflow-hidden">
                {/* Fake dashboard preview */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-3 w-32 bg-white/[0.06] rounded-full" />
                      <div className="h-5 w-48 bg-white/[0.08] rounded-full mt-2" />
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-orange-500/30 flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-400">87%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-2 pt-4">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg"
                        style={{
                          backgroundColor: [
                            '#22c55e', '#eab308', '#f97316', '#ef4444', '#1a1a2e',
                            '#22c55e', '#eab308', '#f97316', '#1a1a2e', '#22c55e',
                          ][i % 10] + (i > 14 ? '30' : '80'),
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              Everything you need to master time
            </h2>
            <p className="text-chrono-text-muted max-w-xl mx-auto">
              Not just a todo app. A complete time operating system.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 hover:bg-chrono-surface-2/50 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4
                              group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={22} className={feature.iconColor} />
                </div>
                <h3 className="text-lg font-semibold text-chrono-text mb-2">{feature.title}</h3>
                <p className="text-sm text-chrono-text-muted leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              Ready to own your time?
            </h2>
            <p className="text-chrono-text-muted mb-8">
              Join Chrono and start building the most productive version of yourself.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl
                       bg-gradient-to-r from-white/[0.12] to-white/[0.06]
                       hover:from-white/[0.16] hover:to-white/[0.1]
                       border border-chrono-border/60 hover:border-chrono-border-light
                       text-sm font-semibold transition-all duration-300 group"
            >
              Get Started — Free
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-chrono-border/30 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-5 h-5">
              <div className="absolute inset-0 rounded-full border-[1.5px] border-red-500/60" />
              <div className="absolute w-1 h-1 rounded-full bg-red-400 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <span className="text-xs text-chrono-text-muted">Chrono v1.0</span>
          </div>
          <p className="text-xs text-chrono-text-muted">Personal Time Operating System</p>
        </div>
      </footer>
    </div>
  );
}
