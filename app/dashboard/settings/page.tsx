'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Palette, Bell, Database, Shield, ExternalLink, Trash2, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function SettingsContent() {
  const { state, setUserName } = useStore();
  const [name, setName] = useState(state.userName);
  const [saved, setSaved] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  
  const searchParams = useSearchParams();
  const successParam = searchParams.get('success');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    async function checkStatus() {
      if (!state.isAuthenticated || !state.user) return;
      const supabase = createClient();
      const { data } = await supabase.from('integration_tokens').select('provider').eq('user_id', state.user.id);
      if (data) {
        setGoogleConnected(data.some(t => t.provider === 'google'));
      }
    }
    checkStatus();
  }, [state.isAuthenticated, state.user]);

  function handleSave() {
    setUserName(name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleClearData() {
    if (confirm('This will delete all your tasks and data. Are you sure?')) {
      localStorage.removeItem('chrono-state');
      window.location.reload();
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 pb-24 md:pb-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold gradient-text mb-1">Settings</h1>
          <p className="text-sm text-chrono-text-muted">Customize your Chrono experience</p>
          {successParam && (
            <div className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} />
              {successParam === 'google_connected' && 'Google Calendar connected successfully!'}
            </div>
          )}
          {errorParam && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              Error connecting integration: {errorParam}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                <User size={20} className="text-chrono-text-secondary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-chrono-text">Profile</h3>
                <p className="text-xs text-chrono-text-muted">Personalize your dashboard</p>
              </div>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="flex-1 px-4 py-2.5 rounded-xl bg-chrono-surface-2 border border-chrono-border/50
                         text-chrono-text text-sm focus:outline-none focus:border-chrono-border-light transition-colors"
              />
              <button
                onClick={handleSave}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${saved
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-white/[0.06] hover:bg-white/[0.1] text-chrono-text border border-chrono-border/40'
                  }`}
              >
                {saved ? '✓ Saved' : 'Save'}
              </button>
            </div>
          </motion.div>

          {/* Integrations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                <ExternalLink size={20} className="text-chrono-text-secondary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-chrono-text">Integrations</h3>
                <p className="text-xs text-chrono-text-muted">Connect external services</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Google Calendar', icon: '📅', authUrl: '/api/integrations/google/auth', connected: googleConnected },
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03]">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{integration.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-chrono-text">{integration.name}</p>
                      <p className="text-[10px] text-chrono-text-muted">
                        {integration.connected ? 'Connected and syncing' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  {integration.connected ? (
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400
                               border border-green-500/20"
                    >
                      Connected
                    </button>
                  ) : (
                    <button
                      onClick={() => window.location.href = integration.authUrl}
                      disabled={!state.isAuthenticated}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] text-chrono-text
                               border border-chrono-border/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {state.isAuthenticated ? 'Connect' : 'Sign in to connect'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                <Bell size={20} className="text-chrono-text-secondary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-chrono-text">Notifications</h3>
                <p className="text-xs text-chrono-text-muted">Manage your reminders</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Task reminders', enabled: true },
                { label: 'Daily planning reminder', enabled: true },
                { label: 'End-of-day summary', enabled: false },
                { label: 'Missed task alerts', enabled: true },
              ].map((notif) => (
                <div key={notif.label} className="flex items-center justify-between">
                  <span className="text-sm text-chrono-text-secondary">{notif.label}</span>
                  <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${notif.enabled ? 'bg-green-500/30' : 'bg-white/[0.06]'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${notif.enabled ? 'left-5 bg-green-400' : 'left-0.5 bg-chrono-text-muted'}`} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6 border-red-500/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-chrono-text">Danger Zone</h3>
                <p className="text-xs text-chrono-text-muted">Irreversible actions</p>
              </div>
            </div>
            <button
              onClick={handleClearData}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500/10 hover:bg-red-500/20
                       text-red-400 border border-red-500/20 hover:border-red-500/30 transition-all duration-200"
            >
              Clear All Data
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="h-full w-full flex items-center justify-center bg-chrono-bg">
        <img src="/branding/chrono-mark.svg" alt="Loading..." className="w-[72px] h-[72px]" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
