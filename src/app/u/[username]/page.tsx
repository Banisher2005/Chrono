'use client';

import React, { use } from 'react';
import { motion } from 'motion/react';
import { Calendar, Flame, Target } from 'lucide-react';
import Link from 'next/link';

// Mock public data generator based on username hash
function generatePublicData(username: string) {
  // Simple hash for deterministic random
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const rng = (seed: number) => {
    let t = hash += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };

  const streak = Math.floor(rng(1) * 30) + 2;
  const hours = Math.floor(rng(2) * 500) + 50;
  
  // Generate a random but deterministic grid
  const grid = Array.from({ length: 52 }).map((_, col) => 
    Array.from({ length: 7 }).map((_, row) => {
      const val = rng(col * 7 + row);
      if (val > 0.9) return 4;
      if (val > 0.7) return 3;
      if (val > 0.4) return 2;
      if (val > 0.2) return 1;
      return 0;
    })
  );

  return { streak, hours, grid };
}

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const username = decodeURIComponent(resolvedParams.username);
  const { streak, hours, grid } = generatePublicData(username);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-red-500/30">
      
      {/* Minimal Header */}
      <nav className="h-16 border-b border-white/[0.05] flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border border-white/80 relative flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          </div>
          <span className="text-sm font-bold tracking-tight">Chrono</span>
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20">
        
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-16">
          <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">@{username}</h1>
            <p className="text-white/50">Chrono User</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="glass p-6 rounded-2xl border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
              <Flame size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{streak} Days</div>
              <div className="text-sm text-white/50">Current Streak</div>
            </div>
          </div>
          <div className="glass p-6 rounded-2xl border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Target size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{hours}h</div>
              <div className="text-sm text-white/50">Deep Focus</div>
            </div>
          </div>
          <div className="glass p-6 rounded-2xl border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
              <Calendar size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">Top 5%</div>
              <div className="text-sm text-white/50">Consistency</div>
            </div>
          </div>
        </div>

        {/* Chrono Grid */}
        <div className="glass p-8 rounded-3xl border border-white/5">
          <h2 className="text-lg font-semibold mb-8 flex items-center gap-2">
            Activity Heatmap
          </h2>
          <div className="flex gap-1 overflow-x-auto pb-4 scrollbar-hide">
            {grid.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-1">
                {col.map((intensity, rowIdx) => {
                  let color = 'bg-white/5';
                  if (intensity === 4) color = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]';
                  if (intensity === 3) color = 'bg-red-500/70';
                  if (intensity === 2) color = 'bg-red-500/40';
                  if (intensity === 1) color = 'bg-red-500/20';

                  return (
                    <motion.div
                      key={rowIdx}
                      whileHover={{ scale: 1.5, zIndex: 10 }}
                      className={`w-3 h-3 rounded-[2px] ${color} cursor-pointer transition-colors`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-between items-center text-xs text-white/40">
            <span>Last 12 months</span>
            <div className="flex items-center gap-2">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-[2px] bg-white/5" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-red-500/20" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-red-500/40" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-red-500" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>

      </main>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
        <Link href="/" className="px-6 py-3 rounded-full bg-white text-black font-semibold text-sm shadow-xl hover:scale-105 transition-transform">
          Create your own Chrono
        </Link>
      </div>
    </div>
  );
}
