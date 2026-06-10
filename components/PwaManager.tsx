'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PwaManager() {
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof window !== 'undefined') {
      return !navigator.onLine;
    }
    return false;
  });
  const [dismissedOffline, setDismissedOffline] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            console.log('Chrono PWA ServiceWorker registered successfully:', reg.scope);
          })
          .catch((err) => {
            console.error('Chrono PWA ServiceWorker registration failed:', err);
          });
      });
    }

    // Network Status Listeners
    const handleOnline = () => {
      setIsOffline(false);
      setDismissedOffline(false);
    };
    
    const handleOffline = () => {
      setIsOffline(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && !dismissedOffline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md"
        >
          <div className="glass px-4 py-3 rounded-xl border border-priority-critical/30 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-priority-critical/20 flex items-center justify-center text-priority-critical">
                <WifiOff size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-chrono-text">Offline Mode</p>
                <p className="text-xs text-chrono-text-secondary">Viewing cached application data.</p>
              </div>
            </div>
            <button
              onClick={() => setDismissedOffline(true)}
              className="text-chrono-text-muted hover:text-chrono-text p-1 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
