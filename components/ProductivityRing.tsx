'use client';

import React from 'react';
import { motion } from 'motion/react';

interface ProductivityRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function ProductivityRing({
  score,
  size = 120,
  strokeWidth = 8,
  className = '',
}: ProductivityRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return { start: '#22c55e', end: '#16a34a' };
    if (score >= 60) return { start: '#eab308', end: '#ca8a04' };
    if (score >= 40) return { start: '#f97316', end: '#ea580c' };
    return { start: '#ef4444', end: '#dc2626' };
  };

  const colors = getColor();
  const gradientId = `ring-gradient-${size}`;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="ring-progress">
        {/* Background Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(39, 39, 42, 0.5)"
          strokeWidth={strokeWidth}
        />
        {/* Gradient Definition */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
        {/* Progress Ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
        />
      </svg>
      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-bold text-chrono-text"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {score}%
        </motion.span>
        <span className="text-[10px] text-chrono-text-muted font-medium uppercase tracking-wider">
          Score
        </span>
      </div>
    </div>
  );
}
