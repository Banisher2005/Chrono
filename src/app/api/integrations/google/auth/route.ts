import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'Google Client ID not configured' }, { status: 500 });
  }

  // The callback URL where Google will redirect back to
  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/integrations/google/callback`;

  // We request Google Calendar readonly scope and offline access to get a refresh token
  const scope = 'https://www.googleapis.com/auth/calendar.readonly';
  const state = crypto.randomUUID();

  // Store state in a cookie for CSRF protection during callback
  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${state}`
  );
  
  response.cookies.set('oauth_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 10 });
  
  return response;
}
