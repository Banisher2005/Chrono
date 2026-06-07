import { format, startOfWeek, addDays, differenceInMinutes, parseISO, isToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { Task, Priority, DayActivity, WeekDay, PRIORITY_CONFIG } from './types';

// ─── Date Helpers ───────────────────────────────────────────────

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatDisplayDate(date: Date): string {
  return format(date, 'EEEE, MMMM d, yyyy');
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function getTaskDuration(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ─── Week Helpers ───────────────────────────────────────────────

export function getWeekDays(tasks: Task[], referenceDate: Date = new Date()): WeekDay[] {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 }); // Monday
  const days: WeekDay[] = [];

  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const dateStr = formatDate(date);
    const dayTasks = tasks.filter(t => t.date === dateStr);
    const totalMinutes = dayTasks.reduce((sum, t) => sum + getTaskDuration(t.startTime, t.endTime), 0);
    const maxMinutes = 8 * 60; // 8 hours max workday

    const priorityBreakdown: Record<Priority, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    dayTasks.forEach(t => priorityBreakdown[t.priority]++);

    days.push({
      date: dateStr,
      dayName: format(date, 'EEE').toUpperCase(),
      workloadPercent: Math.min(100, Math.round((totalMinutes / maxMinutes) * 100)),
      taskCount: dayTasks.length,
      meetingCount: dayTasks.filter(t => t.category === 'Meeting').length,
      tasks: dayTasks.sort((a, b) => a.startTime.localeCompare(b.startTime)),
      priorityBreakdown,
    });
  }

  return days;
}

// ─── Productivity Calculations ──────────────────────────────────

export function calculateDailyScore(tasks: Task[], date: string): number {
  const dayTasks = tasks.filter(t => t.date === date);
  if (dayTasks.length === 0) return 0;

  const completed = dayTasks.filter(t => t.status === 'completed').length;
  const total = dayTasks.length;
  const completionRate = completed / total;

  // Weight by priority
  const priorityScore = dayTasks.reduce((sum, t) => {
    const weight = PRIORITY_CONFIG[t.priority].score;
    return sum + (t.status === 'completed' ? weight : 0);
  }, 0);
  const maxPriorityScore = dayTasks.reduce((sum, t) => sum + PRIORITY_CONFIG[t.priority].score, 0);
  const priorityRate = maxPriorityScore > 0 ? priorityScore / maxPriorityScore : 0;

  return Math.round((completionRate * 0.6 + priorityRate * 0.4) * 100);
}

export function calculateIntensity(tasks: Task[], date: string): number {
  const dayTasks = tasks.filter(t => t.date === date);
  if (dayTasks.length === 0) return 0;

  const priorityScore = dayTasks.reduce((sum, t) => sum + PRIORITY_CONFIG[t.priority].score, 0);
  const taskCount = dayTasks.length;

  const rawScore = (priorityScore * 0.5) + (taskCount * 1.5);

  if (rawScore <= 2) return 1;   // easy
  if (rawScore <= 5) return 2;   // medium
  if (rawScore <= 8) return 3;   // heavy
  return 4;                      // critical
}

export function getIntensityColor(intensity: number): string {
  switch (intensity) {
    case 0: return '#1a1a2e';
    case 1: return '#22c55e';
    case 2: return '#eab308';
    case 3: return '#f97316';
    case 4: return '#ef4444';
    default: return '#1a1a2e';
  }
}

export function getIntensityLabel(intensity: number): string {
  switch (intensity) {
    case 0: return 'No activity';
    case 1: return 'Easy day';
    case 2: return 'Medium workload';
    case 3: return 'Heavy workload';
    case 4: return 'Critical workload';
    default: return 'No activity';
  }
}

// ─── Heatmap Data ───────────────────────────────────────────────

export function getMonthHeatmapData(tasks: Task[], year: number, month: number): DayActivity[] {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return days.map(day => {
    const dateStr = formatDate(day);
    const dayTasks = tasks.filter(t => t.date === dateStr);
    const completed = dayTasks.filter(t => t.status === 'completed').length;
    const meetings = dayTasks.filter(t => t.category === 'Meeting').length;

    return {
      date: dateStr,
      tasksTotal: dayTasks.length,
      tasksCompleted: completed,
      meetings,
      focusScore: calculateDailyScore(tasks, dateStr),
      intensity: calculateIntensity(tasks, dateStr),
    };
  });
}

// ─── Streak Calculation ─────────────────────────────────────────

export function calculateStreak(tasks: Task[]): { current: number; longest: number } {
  const today = new Date();
  let current = 0;
  let longest = 0;
  let tempStreak = 0;

  // Check backwards from today
  for (let i = 0; i < 365; i++) {
    const date = addDays(today, -i);
    const dateStr = formatDate(date);
    const dayTasks = tasks.filter(t => t.date === dateStr);

    if (dayTasks.length > 0 && dayTasks.some(t => t.status === 'completed')) {
      tempStreak++;
      if (i < 1 || current === i) {
        current = tempStreak;
      }
    } else if (i > 0) {
      longest = Math.max(longest, tempStreak);
      tempStreak = 0;
    }
  }
  longest = Math.max(longest, tempStreak);

  return { current, longest };
}

// ─── Hourly Productivity ────────────────────────────────────────

export function getHourlyProductivity(tasks: Task[]): number[] {
  const hours = new Array(24).fill(0);
  const counts = new Array(24).fill(0);

  tasks.filter(t => t.status === 'completed' && t.startTime).forEach(t => {
    const hour = parseInt(t.startTime.split(':')[0]);
    hours[hour]++;
    counts[hour]++;
  });

  const max = Math.max(...hours, 1);
  return hours.map(h => Math.round((h / max) * 100));
}

// ─── Motivational Messages ──────────────────────────────────────

const MESSAGES = [
  "Every minute counts. Make them matter.",
  "Your future self will thank you.",
  "Small steps, big progress.",
  "Focus on what moves the needle.",
  "Time is your most valuable resource.",
  "Build momentum, one task at a time.",
  "Excellence is a habit, not an act.",
  "Clear mind, clear priorities.",
  "Progress over perfection.",
  "You're doing better than you think.",
];

export function getMotivationalMessage(): string {
  const idx = Math.floor(Date.now() / (1000 * 60 * 60)) % MESSAGES.length; // Changes hourly
  return MESSAGES[idx];
}

// ─── Greeting ───────────────────────────────────────────────────

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// ─── Month Calendar Layout ──────────────────────────────────────

export function getCalendarGridOffset(year: number, month: number): number {
  const firstDay = new Date(year, month, 1);
  const day = getDay(firstDay);
  return day === 0 ? 6 : day - 1; // Monday = 0
}
