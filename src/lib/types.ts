// ─── Chrono Type System ─────────────────────────────────────────

export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type TaskSource = 'chrono' | 'google' | 'teams';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string;          // ISO date string YYYY-MM-DD
  startTime: string;     // HH:mm
  endTime: string;       // HH:mm
  priority: Priority;
  category: string;
  status: TaskStatus;
  source: TaskSource;
  createdAt: string;
  completedAt?: string;
  order: number;
}

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

export interface ProductivityStats {
  dailyScore: number;
  weeklyScores: number[];
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  mostProductiveHour: number;
  hourlyProductivity: number[];   // 24 entries, one per hour
  weeklyConsistency: number[];    // 7 entries, Mon-Sun
}

export interface ChronoState {
  tasks: Task[];
  stats: ProductivityStats;
  userName: string;
}

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

export const CATEGORIES = [
  'Work', 'Personal', 'Health', 'Learning', 'Meeting', 'Creative', 'Admin', 'Other'
];
