-- ═══════════════════════════════════════════════════════════════
-- CHRONO v1.0 — Database Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── Enums ─────────────────────────────────────────────────────

CREATE TYPE task_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE task_category AS ENUM ('work', 'study', 'health', 'personal', 'habit');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed', 'missed');
CREATE TYPE task_source AS ENUM ('chrono', 'google', 'teams');
CREATE TYPE event_provider AS ENUM ('google', 'microsoft');

-- ─── Profiles ──────────────────────────────────────────────────

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar TEXT DEFAULT '',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Tasks ─────────────────────────────────────────────────────

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  date DATE NOT NULL,
  start_time TEXT NOT NULL DEFAULT '09:00',
  end_time TEXT NOT NULL DEFAULT '10:00',
  priority task_priority NOT NULL DEFAULT 'medium',
  category task_category NOT NULL DEFAULT 'work',
  status task_status NOT NULL DEFAULT 'todo',
  estimated_minutes INT DEFAULT 60,
  actual_minutes INT,
  source task_source NOT NULL DEFAULT 'chrono',
  sort_order INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_date ON tasks(user_id, date);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Events (External Calendar) ────────────────────────────────

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  provider event_provider NOT NULL,
  title TEXT NOT NULL,
  start_ts TIMESTAMPTZ NOT NULL,
  end_ts TIMESTAMPTZ NOT NULL,
  location TEXT DEFAULT '',
  attendees JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, external_id, provider)
);

CREATE INDEX idx_events_user_date ON events(user_id, start_ts);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events"
  ON events FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own events"
  ON events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON events FOR DELETE USING (auth.uid() = user_id);

-- ─── Productivity ──────────────────────────────────────────────

CREATE TABLE productivity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed_tasks INT NOT NULL DEFAULT 0,
  total_tasks INT NOT NULL DEFAULT 0,
  focus_minutes INT NOT NULL DEFAULT 0,
  chrono_score INT NOT NULL DEFAULT 0,
  streak INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_productivity_user_date ON productivity(user_id, date);

ALTER TABLE productivity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own productivity"
  ON productivity FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own productivity"
  ON productivity FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own productivity"
  ON productivity FOR UPDATE USING (auth.uid() = user_id);

-- ─── AI History ────────────────────────────────────────────────

CREATE TABLE ai_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_history_user ON ai_history(user_id, created_at DESC);

ALTER TABLE ai_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI history"
  ON ai_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI history"
  ON ai_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Focus Sessions ───────────────────────────────────────────

CREATE TABLE focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  start_ts TIMESTAMPTZ NOT NULL,
  end_ts TIMESTAMPTZ,
  duration_minutes INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_focus_user ON focus_sessions(user_id, created_at DESC);

ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own focus sessions"
  ON focus_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own focus sessions"
  ON focus_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus sessions"
  ON focus_sessions FOR UPDATE USING (auth.uid() = user_id);

-- ─── Integration Tokens ───────────────────────────────────────

CREATE TABLE integration_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider event_provider NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

ALTER TABLE integration_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tokens"
  ON integration_tokens FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own tokens"
  ON integration_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens"
  ON integration_tokens FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens"
  ON integration_tokens FOR DELETE USING (auth.uid() = user_id);
