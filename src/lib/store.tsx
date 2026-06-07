'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task, ChronoState, Priority, TaskSource, TaskStatus } from './types';
import { formatDate } from './utils';

// ─── Sample Data ────────────────────────────────────────────────

function generateSampleTasks(): Task[] {
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));
  const tomorrow = formatDate(new Date(Date.now() + 86400000));
  const dayAfter = formatDate(new Date(Date.now() + 2 * 86400000));
  const threeDays = formatDate(new Date(Date.now() + 3 * 86400000));

  // Generate some past completed tasks for streak/analytics
  const pastTasks: Task[] = [];
  for (let i = 1; i <= 14; i++) {
    const d = formatDate(new Date(Date.now() - i * 86400000));
    pastTasks.push({
      id: uuidv4(), title: `Past Task ${i}`, description: '', date: d,
      startTime: '09:00', endTime: '10:00', priority: (['low', 'medium', 'high', 'critical'] as Priority[])[i % 4],
      category: 'Work', status: 'completed', source: 'chrono', createdAt: d, completedAt: d, order: 0,
    });
    if (i % 3 === 0) {
      pastTasks.push({
        id: uuidv4(), title: `Meeting ${i}`, description: '', date: d,
        startTime: '14:00', endTime: '15:00', priority: 'medium',
        category: 'Meeting', status: 'completed', source: 'teams', createdAt: d, completedAt: d, order: 1,
      });
    }
  }

  return [
    ...pastTasks,
    // Yesterday
    { id: uuidv4(), title: 'Review sprint backlog', description: 'Go through all pending items', date: yesterday, startTime: '09:00', endTime: '10:00', priority: 'high', category: 'Work', status: 'completed', source: 'chrono', createdAt: yesterday, completedAt: yesterday, order: 0 },
    { id: uuidv4(), title: 'Team standup', description: 'Daily sync with engineering', date: yesterday, startTime: '10:30', endTime: '11:00', priority: 'medium', category: 'Meeting', status: 'completed', source: 'teams', createdAt: yesterday, completedAt: yesterday, order: 1 },

    // Today
    { id: uuidv4(), title: 'AI Project Submission', description: 'Final review and submit the ML pipeline project', date: today, startTime: '10:00', endTime: '12:00', priority: 'critical', category: 'Work', status: 'pending', source: 'chrono', createdAt: today, order: 0 },
    { id: uuidv4(), title: 'Design Review Meeting', description: 'Review new dashboard mockups with the team', date: today, startTime: '13:00', endTime: '14:00', priority: 'high', category: 'Meeting', status: 'pending', source: 'teams', createdAt: today, order: 1 },
    { id: uuidv4(), title: 'Code Review: Auth Module', description: 'Review PR #247 for the authentication refactor', date: today, startTime: '14:30', endTime: '15:30', priority: 'high', category: 'Work', status: 'pending', source: 'chrono', createdAt: today, order: 2 },
    { id: uuidv4(), title: 'Workout', description: 'Evening run + strength training', date: today, startTime: '18:00', endTime: '19:00', priority: 'medium', category: 'Health', status: 'pending', source: 'chrono', createdAt: today, order: 3 },
    { id: uuidv4(), title: 'Read research papers', description: 'Transformer architecture papers', date: today, startTime: '20:00', endTime: '21:00', priority: 'low', category: 'Learning', status: 'pending', source: 'chrono', createdAt: today, order: 4 },

    // Tomorrow
    { id: uuidv4(), title: 'Client presentation prep', description: 'Prepare slides for Q2 review', date: tomorrow, startTime: '09:00', endTime: '11:00', priority: 'critical', category: 'Work', status: 'pending', source: 'chrono', createdAt: today, order: 0 },
    { id: uuidv4(), title: 'Dentist appointment', description: 'Regular checkup', date: tomorrow, startTime: '15:00', endTime: '16:00', priority: 'medium', category: 'Personal', status: 'pending', source: 'google', createdAt: today, order: 1 },

    // Day after
    { id: uuidv4(), title: 'Sprint planning', description: 'Plan next sprint tasks and priorities', date: dayAfter, startTime: '10:00', endTime: '12:00', priority: 'high', category: 'Meeting', status: 'pending', source: 'teams', createdAt: today, order: 0 },
    { id: uuidv4(), title: 'Database migration', description: 'Run migration scripts for v2 schema', date: dayAfter, startTime: '14:00', endTime: '16:00', priority: 'critical', category: 'Work', status: 'pending', source: 'chrono', createdAt: today, order: 1 },

    // Three days out
    { id: uuidv4(), title: 'Team lunch', description: 'Monthly team building lunch', date: threeDays, startTime: '12:00', endTime: '13:30', priority: 'low', category: 'Personal', status: 'pending', source: 'google', createdAt: today, order: 0 },
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
};

// ─── Actions ────────────────────────────────────────────────────

type Action =
  | { type: 'INIT'; payload: ChronoState }
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'order'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'REORDER_TASKS'; payload: { date: string; taskIds: string[] } }
  | { type: 'SET_USERNAME'; payload: string };

// ─── Reducer ────────────────────────────────────────────────────

function reducer(state: ChronoState, action: Action): ChronoState {
  switch (action.type) {
    case 'INIT':
      return action.payload;

    case 'ADD_TASK': {
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
          const newStatus: TaskStatus = t.status === 'completed' ? 'pending' : 'completed';
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
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = 'chrono-state';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [initialized, setInitialized] = React.useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'INIT', payload: parsed });
      } else {
        // First time: generate sample data
        dispatch({ type: 'INIT', payload: { ...initialState, tasks: generateSampleTasks() } });
      }
    } catch {
      dispatch({ type: 'INIT', payload: { ...initialState, tasks: generateSampleTasks() } });
    }
    setInitialized(true);
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    if (initialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, initialized]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'order'>) => {
    dispatch({ type: 'ADD_TASK', payload: task });
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  const toggleTask = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: id });
  }, []);

  const reorderTasks = useCallback((date: string, taskIds: string[]) => {
    dispatch({ type: 'REORDER_TASKS', payload: { date, taskIds } });
  }, []);

  const setUserName = useCallback((name: string) => {
    dispatch({ type: 'SET_USERNAME', payload: name });
  }, []);

  if (!initialized) {
    return null; // Prevent hydration mismatch
  }

  return (
    <StoreContext.Provider value={{ state, addTask, updateTask, deleteTask, toggleTask, reorderTasks, setUserName }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
