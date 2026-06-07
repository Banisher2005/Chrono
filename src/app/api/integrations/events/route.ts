import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Task, IntegrationToken } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: tokens, error } = await supabase
    .from('integration_tokens')
    .select('*')
    .eq('user_id', user.id);

  if (error || !tokens || tokens.length === 0) {
    return NextResponse.json({ tasks: [] });
  }

  let allTasks: Task[] = [];

  for (const token of tokens as any[]) {
    // Check if token is expired (margin of 5 mins)
    let accessToken = token.access_token;
    
    // In a full production app, you would use token.refresh_token to get a new access token here
    // using the Google/Microsoft OAuth endpoints and update the database. 
    // For this implementation, we will try to use the current access token.

    if (token.provider === 'google') {
      try {
        const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days past
        const timeMax = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 days future
        
        const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          const items = data.items || [];
          
          const gTasks: Task[] = items
            .filter((item: any) => item.start?.dateTime) // Only timed events
            .map((item: any) => {
              const start = new Date(item.start.dateTime);
              const end = new Date(item.end.dateTime);
              
              const dateStr = start.toISOString().split('T')[0];
              const startTime = start.toTimeString().substring(0, 5);
              const endTime = end.toTimeString().substring(0, 5);
              
              return {
                id: `gcal-${item.id}`,
                title: item.summary || 'Busy',
                description: item.description || '',
                date: dateStr,
                startTime,
                endTime,
                priority: 'medium' as const,
                category: 'work',
                status: 'todo' as const,
                source: 'google' as const,
                order: 0,
                createdAt: new Date().toISOString()
              };
            });
            
          allTasks = [...allTasks, ...gTasks];
        } else if (res.status === 401) {
          console.warn('Google token expired for user', user.id);
        }
      } catch (err) {
        console.error('Failed to fetch Google events', err);
      }
    }
  }

  return NextResponse.json({ tasks: allTasks });
}
