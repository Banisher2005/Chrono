// ─── Chrono v1.0 Type System ─────────────────────────────────────

// ─── Enums ──────────────────────────────────────────────────────

export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type TaskSource = 'chrono' | 'google' | 'teams';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'missed';
export type TaskCategory = 'work' | 'study' | 'health' | 'personal' | 'habit';
export type EventProvider = 'google' | 'microsoft';

// Legacy alias for backwards compatibility with existing components
export type LegacyTaskStatus = 'pending' | 'in-progress' | 'completed';

// ─── Core Models ────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  timezone: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId?: string;
  title: string;
  description: string;
  date: string;          // YYYY-MM-DD
  startTime: string;     // HH:mm
  endTime: string;       // HH:mm
  priority: Priority;
  category: string;
  status: TaskStatus;
  source: TaskSource;
  estimatedMinutes?: number;
  actualMinutes?: number;
  order: number;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface CalendarEvent {
  id: string;
  userId?: string;
  externalId: string;
  provider: EventProvider;
  title: string;
  start: string;       // ISO datetime
  end: string;         // ISO datetime
  location?: string;
  attendees?: string[];
}

export interface FocusSession {
  id: string;
  userId?: string;
  taskId?: string;
  startTs: string;
  endTs?: string;
  durationMinutes: number;
  completed: boolean;
}

export interface IntegrationToken {
  id: string;
  userId: string;
  provider: EventProvider;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  tasks?: GeneratedTask[];
  applied?: boolean;
}

export interface GeneratedTask {
  title: string;
  date: string;
  priority: Priority;
  description: string;
  startTime: string;
  endTime: string;
}

// ─── Analytics / Productivity ───────────────────────────────────

export interface DayActivity {
  date: string;
  tasksTotal: number;
  tasksCompleted: number;
  meetings: number;
  focusScore: number;
  intensity: number;     // 0-4 scale for heatmap
}

export interface WeekDay {
  date: string;
  dayName: string;
  workloadPercent: number;
  taskCount: number;
  meetingCount: number;
  tasks: Task[];
  priorityBreakdown: Record<Priority, number>;
}

export interface ChronoScoreBreakdown {
  total: number;           // 0-100
  taskCompletion: number;  // 0-100
  consistency: number;     // 0-100
  focusTime: number;       // 0-100
  deadlineManagement: number; // 0-100
}

export interface ProductivityStats {
  dailyScore: number;
  weeklyScores: number[];
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  mostProductiveHour: number;
  hourlyProductivity: number[];
  weeklyConsistency: number[];
  chronoScore?: ChronoScoreBreakdown;
}

// ─── App State ──────────────────────────────────────────────────

export interface ChronoState {
  tasks: Task[];
  stats: ProductivityStats;
  userName: string;
  user: UserProfile | null;
  isAuthenticated: boolean;
  selectedDate: string;
}

// ─── Config ─────────────────────────────────────────────────────

export const PRIORITY_CONFIG: Record<Priority, { color: string; label: string; score: number; bgClass: string; borderClass: string }> = {
  critical: { color: '#ef4444', label: 'Critical', score: 4, bgClass: 'bg-red-500/10', borderClass: 'border-l-red-500' },
  high:     { color: '#f97316', label: 'High',     score: 3, bgClass: 'bg-orange-500/10', borderClass: 'border-l-orange-500' },
  medium:   { color: '#eab308', label: 'Medium',   score: 2, bgClass: 'bg-yellow-500/10', borderClass: 'border-l-yellow-500' },
  low:      { color: '#22c55e', label: 'Low',      score: 1, bgClass: 'bg-green-500/10', borderClass: 'border-l-green-500' },
};

export const SOURCE_CONFIG: Record<TaskSource, { label: string; icon: string }> = {
  chrono: { label: 'Chrono', icon: '⏱' },
  google: { label: 'Google Calendar', icon: '📅' },
  teams:  { label: 'Microsoft Teams', icon: '💬' },
};

export const PRIORITY_ORDER: Priority[] = ['critical', 'high', 'medium', 'low'];

export const CATEGORIES: TaskCategory[] = ['work', 'study', 'health', 'personal', 'habit'];

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  work: 'Work',
  study: 'Study',
  health: 'Health',
  personal: 'Personal',
  habit: 'Habit',
};

// ─── Helper: convert DB row → Task ─────────────────────────────

export function dbRowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    description: (row.description as string) || '',
    date: row.date as string,
    startTime: row.start_time as string,
    endTime: row.end_time as string,
    priority: row.priority as Priority,
    category: row.category as string,
    status: row.status as TaskStatus,
    source: row.source as TaskSource,
    estimatedMinutes: row.estimated_minutes as number | undefined,
    actualMinutes: row.actual_minutes as number | undefined,
    order: (row.sort_order as number) || 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string | undefined,
    completedAt: row.completed_at as string | undefined,
  };
}

export function taskToDbRow(task: Partial<Task> & { userId?: string }) {
  const row: Record<string, unknown> = {};
  if (task.userId) row.user_id = task.userId;
  if (task.title !== undefined) row.title = task.title;
  if (task.description !== undefined) row.description = task.description;
  if (task.date !== undefined) row.date = task.date;
  if (task.startTime !== undefined) row.start_time = task.startTime;
  if (task.endTime !== undefined) row.end_time = task.endTime;
  if (task.priority !== undefined) row.priority = task.priority;
  if (task.category !== undefined) row.category = task.category;
  if (task.status !== undefined) row.status = task.status;
  if (task.source !== undefined) row.source = task.source;
  if (task.estimatedMinutes !== undefined) row.estimated_minutes = task.estimatedMinutes;
  if (task.actualMinutes !== undefined) row.actual_minutes = task.actualMinutes;
  if (task.order !== undefined) row.sort_order = task.order;
  if (task.completedAt !== undefined) row.completed_at = task.completedAt;
  return row;
}
