import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function saveAIMessage(userId: string, prompt: string, response: string) {
  const { error } = await supabase
    .from('ai_history')
    .insert({ user_id: userId, prompt, response });

  if (error) console.error('Failed to save AI history:', error);
}

export async function getAIHistory(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('ai_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
