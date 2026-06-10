'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Grid3X3, Timer, BarChart3, Calendar, CheckSquare, Layout, Command, Shield, MessageSquare } from 'lucide-react';

const Logo = () => (
  <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
    <div className="w-6 h-6 rounded-full border-[1.5px] border-white/[0.8]" />
    <div className="absolute w-1.5 h-1.5 rounded-full bg-red-500 animate-orbit" />
    <div className="absolute w-1 h-1 rounded-full bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
  </div>
);

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-black/50 border-b border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-lg font-semibold tracking-tight text-white">Chrono</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all flex items-center gap-2"
          >
            Start Planning <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-40 pb-32 px-6 flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-white/5 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-xs text-white/60 mb-8 backdrop-blur-md">
          <Sparkles size={12} className="text-red-400" />
          <span>Chrono v1.1 is now live</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.05] mb-8 text-white">
          Your Time. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/40 to-white/10">Visualized.</span>
        </h1>

        <p className="text-lg md:text-2xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
          An AI-powered operating system for planning your days, protecting your focus, and understanding your productivity.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/login"
            className="px-8 py-4 rounded-full bg-white text-black text-sm font-semibold hover:scale-105 transition-transform flex items-center gap-2"
          >
            Start Planning <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>

      {/* Animated Dashboard Preview */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-24 relative w-full max-w-5xl mx-auto perspective-1000 z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent z-20" />
        <div className="relative rounded-2xl border border-white/[0.1] bg-[#111113]/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-red-500/10">
          {/* Mac Header */}
          <div className="h-10 border-b border-white/[0.05] flex items-center px-4 gap-2 bg-white/[0.02]">
            <div className="w-3 h-3 rounded-full bg-white/20" />
            <div className="w-3 h-3 rounded-full bg-white/20" />
            <div className="w-3 h-3 rounded-full bg-white/20" />
          </div>
          {/* UI Mockup */}
          <div className="p-8 grid grid-cols-12 gap-6 h-[400px]">
            {/* Sidebar */}
            <div className="col-span-3 space-y-4">
              <div className="h-6 w-24 bg-white/10 rounded" />
              <div className="space-y-2 mt-8">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-8 bg-white/5 rounded-lg" />)}
              </div>
            </div>
            {/* Main */}
            <div className="col-span-6 border-x border-white/[0.05] px-6 space-y-6">
              <div className="h-8 w-48 bg-white/10 rounded" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                    className="h-16 bg-gradient-to-r from-white/[0.05] to-transparent border border-white/[0.05] rounded-xl flex items-center px-4 gap-4"
                  >
                    <div className="w-4 h-4 rounded-sm border border-white/20" />
                    <div className="h-3 w-32 bg-white/20 rounded" />
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Right Panel */}
            <div className="col-span-3 space-y-6">
              {/* Score */}
              <div className="aspect-square rounded-2xl border border-red-500/20 bg-red-500/5 flex items-center justify-center flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-red-500/10 blur-xl" />
                <span className="text-4xl font-bold text-white relative z-10">92</span>
                <span className="text-xs text-red-400 font-medium mt-1 relative z-10">Chrono Score</span>
              </div>
              {/* Heatmap Mini */}
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className={`aspect-square rounded-sm ${i % 4 === 0 ? 'bg-red-500/80' : i % 3 === 0 ? 'bg-red-500/40' : 'bg-white/5'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Section1_Problem() {
  return (
    <section className="py-32 px-6 relative">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Your life is scattered.</h2>
        <p className="text-xl text-white/50 mb-16">Calendar. Tasks. Meetings. Notes. <br /> Chrono connects everything into a single, intelligent timeline.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Calendar, label: "Google Calendar", color: "text-blue-400" },
            { icon: CheckSquare, label: "Todo Apps", color: "text-green-400" },
            { icon: MessageSquare, label: "Teams / Zoom", color: "text-purple-400" },
            { icon: Layout, label: "Notes", color: "text-yellow-400" },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="glass rounded-2xl p-6 flex flex-col items-center justify-center gap-4 border border-white/[0.05]"
            >
              <item.icon size={32} className={`${item.color} opacity-80`} />
              <span className="text-sm font-medium text-white/70">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function Section2_AI() {
  return (
    <section className="py-32 px-6 bg-white/[0.02] border-y border-white/[0.05]">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold mb-6">
            <Sparkles size={12} /> Chrono AI
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Don't plan. <br /> Just ask.</h2>
          <p className="text-lg text-white/50 mb-8 leading-relaxed">
            Powered by Google Gemini, Chrono AI understands your calendar load, your focus history, and your deadlines. It doesn't just make a list—it optimizes your entire day.
          </p>
        </div>
        
        {/* Chat Simulation */}
        <div className="glass rounded-3xl p-6 border border-white/[0.1] shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
          <div className="space-y-6 relative z-10">
            {/* User Message */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex justify-end">
              <div className="bg-white/10 rounded-2xl rounded-tr-sm px-5 py-3 text-sm text-white max-w-[80%]">
                I have final exams next week. I need to study Physics and Calculus, but I have a meeting tomorrow at 2 PM.
              </div>
            </motion.div>
            
            {/* AI Message */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="flex justify-start">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl rounded-tl-sm px-5 py-4 text-sm text-white max-w-[90%]">
                <div className="flex items-center gap-2 mb-3 text-red-400 font-semibold">
                  <Sparkles size={14} /> Chrono AI
                </div>
                <p className="text-white/80 mb-4">I've analyzed your schedule and created a preparation plan.</p>
                <div className="space-y-2">
                  <div className="bg-black/40 rounded-lg p-3 flex items-center gap-3 border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="flex-1">Physics: Quantum Mechanics</span>
                    <span className="text-white/50 text-xs">10:00 AM (2 hrs)</span>
                  </div>
                  <div className="bg-black/40 rounded-lg p-3 flex items-center gap-3 border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="flex-1">Calculus: Integration</span>
                    <span className="text-white/50 text-xs">4:00 PM (Deep Focus)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Section3_Grid() {
  return (
    <section className="py-32 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Your history. Visualized.</h2>
        <p className="text-lg text-white/50 mb-16 max-w-2xl mx-auto">
          The Chrono Grid gives you a GitHub-style heatmap of your productivity. Instantly see your streaks, intense focus days, and long-term momentum.
        </p>

        <div className="glass rounded-3xl p-8 border border-white/[0.05] inline-block">
          <div className="flex gap-2">
            {Array.from({ length: 24 }).map((_, col) => (
              <div key={col} className="flex flex-col gap-2">
                {Array.from({ length: 7 }).map((_, row) => {
                  // Use a predictable pseudo-random value based on col and row to prevent hydration mismatch
                  const intensity = Math.abs(Math.sin(col * 10 + row * 3.14));
                  let color = 'bg-white/5';
                  if (intensity > 0.9) color = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
                  else if (intensity > 0.7) color = 'bg-red-500/70';
                  else if (intensity > 0.4) color = 'bg-red-500/40';
                  else if (intensity > 0.2) color = 'bg-red-500/20';
                  
                  return (
                    <motion.div
                      key={row}
                      whileHover={{ scale: 1.5, zIndex: 10 }}
                      className={`w-4 h-4 rounded-[3px] ${color} cursor-pointer transition-colors duration-300`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Section4_Focus() {
  return (
    <section className="py-32 px-6 bg-white/[0.02] border-y border-white/[0.05]">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center"
      >
        <div className="order-2 md:order-1 relative">
          <div className="absolute inset-0 bg-red-500/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="glass rounded-[3rem] p-12 border border-white/[0.1] text-center relative z-10 flex flex-col items-center">
            <div className="text-red-400 font-mono text-7xl tracking-tighter font-light mb-6">
              25:00
            </div>
            <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm mb-8 inline-flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Deep Work: System Architecture
            </div>
            <div className="flex gap-4">
              <button className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform">
                <Timer size={24} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="order-1 md:order-2">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Protect your focus.</h2>
          <p className="text-lg text-white/50 mb-8 leading-relaxed">
            Enter Focus Mode to silence distractions. Chrono links directly to your current task, tracks your deep work sessions, and automatically logs completion.
          </p>
          <ul className="space-y-4">
            {['Custom Pomodoro Intervals', 'Task-linked sessions', 'Automatic interruption tracking'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-white/70">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                  <CheckSquare size={12} />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-y-auto selection:bg-red-500/30">
      <Navbar />
      <main>
        <HeroSection />
        <Section1_Problem />
        <Section2_AI />
        <Section3_Grid />
        <Section4_Focus />
        
        {/* Simple CTA Section */}
        <section className="py-32 px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Ready to own your time?</h2>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-white text-black text-lg font-bold hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            Enter Chrono <ArrowRight size={20} />
          </Link>
        </section>
      </main>
      
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-white/50 font-medium">Chrono v1.1</span>
          </div>
          <p className="text-white/30 text-sm">Personal Time Operating System.</p>
        </div>
      </footer>
    </div>
  );
}
