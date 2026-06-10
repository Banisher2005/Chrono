'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task, ChronoState, Priority, TaskSource, TaskStatus, UserProfile } from './types';
import { formatDate } from './utils';
import { createClient } from './supabase/client';
import * as tasksApi from './api/tasks';

// ─── Sample Data ────────────────────────────────────────────────

function generateSampleTasks(): Task[] {
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));
  const tomorrow = formatDate(new Date(Date.now() + 86400000));
  const dayAfter = formatDate(new Date(Date.now() + 2 * 86400000));
  const threeDays = formatDate(new Date(Date.now() + 3 * 86400000));

  const pastTasks: Task[] = [];
  for (let i = 1; i <= 14; i++) {
    const d = formatDate(new Date(Date.now() - i * 86400000));
    pastTasks.push({
      id: uuidv4(), title: `Past Task ${i}`, description: '', date: d,
      startTime: '09:00', endTime: '10:00', priority: (['low', 'medium', 'high', 'critical'] as Priority[])[i % 4],
      category: 'work', status: 'completed', source: 'chrono', createdAt: d, completedAt: d, order: 0,
    });
    if (i % 3 === 0) {
      pastTasks.push({
        id: uuidv4(), title: `Meeting ${i}`, description: '', date: d,
        startTime: '14:00', endTime: '15:00', priority: 'medium',
        category: 'work', status: 'completed', source: 'teams', createdAt: d, completedAt: d, order: 1,
      });
    }
  }

  return [
    ...pastTasks,
    { id: uuidv4(), title: 'Review sprint backlog', description: 'Go through all pending items', date: yesterday, startTime: '09:00', endTime: '10:00', priority: 'high', category: 'work', status: 'completed', source: 'chrono', createdAt: yesterday, completedAt: yesterday, order: 0 },
    { id: uuidv4(), title: 'Team standup', description: 'Daily sync with engineering', date: yesterday, startTime: '10:30', endTime: '11:00', priority: 'medium', category: 'work', status: 'completed', source: 'teams', createdAt: yesterday, completedAt: yesterday, order: 1 },
    { id: uuidv4(), title: 'AI Project Submission', description: 'Final review and submit the ML pipeline project', date: today, startTime: '10:00', endTime: '12:00', priority: 'critical', category: 'work', status: 'todo', source: 'chrono', createdAt: today, order: 0 },
    { id: uuidv4(), title: 'Design Review Meeting', description: 'Review new dashboard mockups with the team', date: today, startTime: '13:00', endTime: '14:00', priority: 'high', category: 'work', status: 'todo', source: 'teams', createdAt: today, order: 1 },
    { id: uuidv4(), title: 'Code Review: Auth Module', description: 'Review PR #247 for the authentication refactor', date: today, startTime: '14:30', endTime: '15:30', priority: 'high', category: 'work', status: 'todo', source: 'chrono', createdAt: today, order: 2 },
    { id: uuidv4(), title: 'Workout', description: 'Evening run + strength training', date: today, startTime: '18:00', endTime: '19:00', priority: 'medium', category: 'health', status: 'todo', source: 'chrono', createdAt: today, order: 3 },
    { id: uuidv4(), title: 'Read research papers', description: 'Transformer architecture papers', date: today, startTime: '20:00', endTime: '21:00', priority: 'low', category: 'study', status: 'todo', source: 'chrono', createdAt: today, order: 4 },
    { id: uuidv4(), title: 'Client presentation prep', description: 'Prepare slides for Q2 review', date: tomorrow, startTime: '09:00', endTime: '11:00', priority: 'critical', category: 'work', status: 'todo', source: 'chrono', createdAt: today, order: 0 },
    { id: uuidv4(), title: 'Dentist appointment', description: 'Regular checkup', date: tomorrow, startTime: '15:00', endTime: '16:00', priority: 'medium', category: 'personal', status: 'todo', source: 'google', createdAt: today, order: 1 },
    { id: uuidv4(), title: 'Sprint planning', description: 'Plan next sprint tasks and priorities', date: dayAfter, startTime: '10:00', endTime: '12:00', priority: 'high', category: 'work', status: 'todo', source: 'teams', createdAt: today, order: 0 },
    { id: uuidv4(), title: 'Database migration', description: 'Run migration scripts for v2 schema', date: dayAfter, startTime: '14:00', endTime: '16:00', priority: 'critical', category: 'work', status: 'todo', source: 'chrono', createdAt: today, order: 1 },
    { id: uuidv4(), title: 'Team lunch', description: 'Monthly team building lunch', date: threeDays, startTime: '12:00', endTime: '13:30', priority: 'low', category: 'personal', status: 'todo', source: 'google', createdAt: today, order: 0 },
  ];
}

// ─── Initial State ──────────────────────────────────────────────

const initialState: ChronoState = {
  tasks: [],
  stats: {
    dailyScore: 0,
    weeklyScores: [],
    currentStreak: 0,
    longestStreak: 0,
    totalTasksCompleted: 0,
    mostProductiveHour: 10,
    hourlyProductivity: new Array(24).fill(0),
    weeklyConsistency: new Array(7).fill(0),
  },
  userName: 'User',
  user: null,
  isAuthenticated: false,
  selectedDate: formatDate(new Date()),
};

// ─── Actions ────────────────────────────────────────────────────

type Action =
  | { type: 'INIT'; payload: ChronoState }
  | { type: 'SET_USER'; payload: UserProfile | null }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'ADD_TASK_LOCAL'; payload: Omit<Task, 'id' | 'createdAt' | 'order'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'REORDER_TASKS'; payload: { date: string; taskIds: string[] } }
  | { type: 'SET_USERNAME'; payload: string }
  | { type: 'SET_SELECTED_DATE'; payload: string };

// ─── Reducer ────────────────────────────────────────────────────

function reducer(state: ChronoState, action: Action): ChronoState {
  switch (action.type) {
    case 'INIT':
      return action.payload;

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        userName: action.payload?.name || state.userName,
      };

    case 'SET_TASKS':
      return { ...state, tasks: action.payload };

    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };

    case 'ADD_TASK_LOCAL': {
      const dateTasks = state.tasks.filter(t => t.date === action.payload.date);
      const newTask: Task = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        order: dateTasks.length,
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        ),
      };

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };

    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => {
          if (t.id !== action.payload) return t;
          const newStatus: TaskStatus = t.status === 'completed' ? 'todo' : 'completed';
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
          };
        }),
      };

    case 'REORDER_TASKS': {
      const reordered = state.tasks.map(t => {
        if (t.date !== action.payload.date) return t;
        const newOrder = action.payload.taskIds.indexOf(t.id);
        return newOrder >= 0 ? { ...t, order: newOrder } : t;
      });
      return { ...state, tasks: reordered };
    }

    case 'SET_USERNAME':
      return { ...state, userName: action.payload };

    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };

    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────

interface StoreContextType {
  state: ChronoState;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'order'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  reorderTasks: (date: string, taskIds: string[]) => void;
  setUserName: (name: string) => void;
  setSelectedDate: (date: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = 'chrono-state';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [initialized, setInitialized] = React.useState(false);

  // ─── Initialize: check auth + load data ─────────────────────
  useEffect(() => {
    async function init() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Authenticated: load from Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          const userProfile: UserProfile = {
            id: user.id,
            name: profile?.name || user.user_metadata?.full_name || 'User',
            email: user.email || '',
            avatar: profile?.avatar || user.user_metadata?.avatar_url || '',
            timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            createdAt: user.created_at,
          };

          dispatch({ type: 'SET_USER', payload: userProfile });

          // Load tasks from Supabase
          let tasks = await tasksApi.fetchTasks(user.id);
          
          // Load external calendar events
          try {
            const eventsRes = await fetch('/api/integrations/events');
            if (eventsRes.ok) {
              const { tasks: externalTasks } = await eventsRes.json();
              if (externalTasks && externalTasks.length > 0) {
                // Filter out external tasks from DB to avoid duplicates if they were cached previously
                tasks = tasks.filter(t => t.source === 'chrono');
                tasks = [...tasks, ...externalTasks];
              }
            }
          } catch (err) {
            console.error('Failed to fetch external events:', err);
          }

          dispatch({ type: 'SET_TASKS', payload: tasks });
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
              ...initialState,
              tasks,
              userName: userProfile.name,
              user: userProfile,
              isAuthenticated: true,
            }));
          } catch { /* ignore storage errors */ }

        } else {
          // Not authenticated: load from localStorage (offline / demo mode)
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            // Migrate old status values
            if (parsed.tasks) {
              parsed.tasks = parsed.tasks.map((t: Task) => ({
                ...t,
                status: t.status === 'pending' as unknown ? 'todo' : t.status === 'in-progress' as unknown ? 'in_progress' : t.status,
              }));
            }
            dispatch({ type: 'INIT', payload: { ...initialState, ...parsed, selectedDate: parsed.selectedDate || formatDate(new Date()), user: null, isAuthenticated: false } });
          } else {
            dispatch({ type: 'INIT', payload: { ...initialState, tasks: generateSampleTasks() } });
          }
        }
      } catch (err) {
        console.error('Init error:', err);
        // Fallback to localStorage
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            dispatch({ type: 'INIT', payload: { ...initialState, ...parsed, selectedDate: parsed.selectedDate || formatDate(new Date()) } });
          } else {
            dispatch({ type: 'INIT', payload: { ...initialState, tasks: generateSampleTasks() } });
          }
        } catch {
          dispatch({ type: 'INIT', payload: { ...initialState, tasks: generateSampleTasks() } });
        }
      }
      setInitialized(true);
    }

    init();
  }, []);

  // ─── Persist to localStorage on state change ─────────────────
  useEffect(() => {
    if (initialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch { /* ignore */ }
    }
  }, [state, initialized]);

  // ─── CRUD Actions ─────────────────────────────────────────────

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'order'>) => {
    if (state.isAuthenticated && state.user) {
      try {
        const created = await tasksApi.createTask(state.user.id, task);
        dispatch({ type: 'ADD_TASK', payload: created });
        return;
      } catch (err) {
        console.error('Supabase createTask failed, falling back:', err);
      }
    }
    // Fallback: local-only
    dispatch({ type: 'ADD_TASK_LOCAL', payload: task });
  }, [state.isAuthenticated, state.user]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    // Optimistic update
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });

    if (state.isAuthenticated) {
      try {
        await tasksApi.updateTask(id, updates);
      } catch (err) {
        console.error('Supabase updateTask failed:', err);
      }
    }
  }, [state.isAuthenticated]);

  const deleteTask = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });

    if (state.isAuthenticated) {
      try {
        await tasksApi.deleteTask(id);
      } catch (err) {
        console.error('Supabase deleteTask failed:', err);
      }
    }
  }, [state.isAuthenticated]);

  const toggleTask = useCallback(async (id: string) => {
    // Optimistic toggle
    dispatch({ type: 'TOGGLE_TASK', payload: id });

    if (state.isAuthenticated) {
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        try {
          await tasksApi.toggleTask(id, task.status);
        } catch (err) {
          console.error('Supabase toggleTask failed:', err);
        }
      }
    }
  }, [state.isAuthenticated, state.tasks]);

  const reorderTasks = useCallback(async (date: string, taskIds: string[]) => {
    // Optimistic UI update
    dispatch({ type: 'REORDER_TASKS', payload: { date, taskIds } });

    if (state.isAuthenticated) {
      try {
        await tasksApi.updateTaskOrder(taskIds);
      } catch (err) {
        console.error('Supabase updateTaskOrder failed:', err);
      }
    }
  }, [state.isAuthenticated]);

  const setUserName = useCallback(async (name: string) => {
    dispatch({ type: 'SET_USERNAME', payload: name });

    if (state.isAuthenticated && state.user) {
      try {
        const supabase = createClient();
        await supabase
          .from('profiles')
          .update({ name })
          .eq('id', state.user.id);
      } catch (err) {
        console.error('Profile update failed:', err);
      }
    }
  }, [state.isAuthenticated, state.user]);

  const setSelectedDate = useCallback((date: string) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date });
  }, []);

  if (!initialized) {
    return null;
  }

  return (
    <StoreContext.Provider value={{ state, addTask, updateTask, deleteTask, toggleTask, reorderTasks, setUserName, setSelectedDate }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
