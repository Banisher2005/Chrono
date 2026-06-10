'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Calendar,
  Grid3X3,
  Sparkles,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Brain,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/dashboard/grid', icon: Grid3X3, label: 'Chrono Grid' },
  { href: '/dashboard/focus', icon: Brain, label: 'Focus Mode' },
  { href: '/dashboard/ai', icon: Sparkles, label: 'Chrono AI' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 220 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="hidden md:flex flex-col h-full glass-strong z-30 relative flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center px-4 h-16 border-b border-chrono-border/50">
        <Link href="/dashboard" className="flex items-center">
          {collapsed ? (
            <img src="/branding/chrono-mark.svg" alt="Chrono" className="w-10 h-10" />
          ) : (
            <img src="/branding/chrono-logo.svg" alt="Chrono" className="h-10 object-contain" />
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 relative group
                ${active
                  ? 'text-chrono-text bg-white/[0.06]'
                  : 'text-chrono-text-muted hover:text-chrono-text-secondary hover:bg-white/[0.03]'
                }
              `}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute inset-0 rounded-xl bg-white/[0.06] border border-chrono-border/40"
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                />
              )}
              <item.icon size={20} className="relative z-10 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10 whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-chrono-border/50
                   text-chrono-text-muted hover:text-chrono-text transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </motion.aside>
  );
}

// ─── Mobile Bottom Nav ──────────────────────────────────────────

export function MobileNav() {
  const pathname = usePathname();

  const mobileItems = [
    { ...NAV_ITEMS[0], label: 'Today' },
    { ...NAV_ITEMS[1], label: 'Calendar' },
    { ...NAV_ITEMS[4], label: 'AI' },
    { ...NAV_ITEMS[3], label: 'Focus' },
    { ...NAV_ITEMS[6], label: 'Profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-chrono-border/50">
      <div className="flex items-center justify-around h-16 px-2">
        {mobileItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl
                transition-all duration-200
                ${active ? 'text-chrono-text' : 'text-chrono-text-muted'}
              `}
            >
              <div className="relative">
                <item.icon size={20} />
                {active && (
                  <motion.div
                    layoutId="mobile-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-priority-critical"
                  />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
