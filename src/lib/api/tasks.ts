import { createClient } from '@/lib/supabase/client';
import { Task, dbRowToTask, taskToDbRow } from '@/lib/types';

const supabase = createClient();

// ─── Server-like API layer (runs in browser, talks to Supabase) ──

export async function fetchTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []).map(dbRowToTask);
}

export async function createTask(userId: string, task: Omit<Task, 'id' | 'createdAt' | 'order' | 'userId'>): Promise<Task> {
  // Get current max order for the date
  const { data: existing } = await supabase
    .from('tasks')
    .select('sort_order')
    .eq('user_id', userId)
    .eq('date', task.date)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? (existing[0].sort_order + 1) : 0;

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: task.title,
      description: task.description || '',
      date: task.date,
      start_time: task.startTime,
      end_time: task.endTime,
      priority: task.priority,
      category: task.category,
      status: task.status || 'todo',
      source: task.source || 'chrono',
      estimated_minutes: task.estimatedMinutes || 60,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return dbRowToTask(data);
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  const dbUpdates = taskToDbRow(updates);

  const { data, error } = await supabase
    .from('tasks')
    .update(dbUpdates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return dbRowToTask(data);
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
}

export async function toggleTask(taskId: string, currentStatus: string): Promise<Task> {
  const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
  const updates: Record<string, unknown> = {
    status: newStatus,
    completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return dbRowToTask(data);
}

export async function updateTaskOrder(taskIds: string[]): Promise<void> {
  const promises = taskIds.map((id, index) =>
    supabase
      .from('tasks')
      .update({ sort_order: index })
      .eq('id', id)
  );

  const results = await Promise.all(promises);
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    throw new Error('Failed to update some task orders');
  }
}
