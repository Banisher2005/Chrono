import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center justify-center p-6 selection:bg-red-500/30 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="text-center relative z-10 max-w-lg">
        {/* Animated orbital rings */}
        <div className="relative w-32 h-32 mx-auto mb-12 flex items-center justify-center">
          <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-4 border border-red-500/30 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_15px_#ef4444]" />
        </div>

        <h1 className="text-6xl font-bold mb-4 font-mono">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Timeline divergence detected.</h2>
        <p className="text-white/50 mb-10 leading-relaxed">
          The page you are looking for has been lost to the void. It might have been deleted, or the URL might be incorrect.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-white text-black font-semibold hover:scale-105 transition-transform"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
