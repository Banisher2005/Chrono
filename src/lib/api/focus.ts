import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function saveFocusSession(userId: string, durationMinutes: number, taskId?: string) {
  const { error } = await supabase
    .from('focus_sessions')
    .insert({
      user_id: userId,
      task_id: taskId || null,
      start_ts: new Date(Date.now() - durationMinutes * 60000).toISOString(),
      end_ts: new Date().toISOString(),
      duration_minutes: durationMinutes,
      completed: true,
    });

  if (error) {
    console.error('Failed to save focus session:', error);
  }
}
