import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  // 1. Check user auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Validate CSRF state
  const cookieStore = request.cookies;
  const savedState = cookieStore.get('oauth_state')?.value;

  if (!state || state !== savedState) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=invalid_state', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=no_code', request.url));
  }

  // 3. Exchange code for tokens
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${url.origin}/api/integrations/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=missing_credentials', request.url));
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Google token error:', tokenData);
      return NextResponse.redirect(new URL('/dashboard/settings?error=token_failed', request.url));
    }

    // 4. Save to database
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    const { error: dbError } = await supabase
      .from('integration_tokens')
      .upsert({
        user_id: user.id,
        provider: 'google',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null, // Might not be returned if previously authorized without prompt=consent
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,provider' });

    if (dbError) {
      console.error('DB Error saving token:', dbError);
      return NextResponse.redirect(new URL('/dashboard/settings?error=db_error', request.url));
    }

    // Clear state cookie
    const response = NextResponse.redirect(new URL('/dashboard/settings?success=google_connected', request.url));
    response.cookies.delete('oauth_state');
    
    return response;

  } catch (err) {
    console.error('Callback exception:', err);
    return NextResponse.redirect(new URL('/dashboard/settings?error=server_error', request.url));
  }
}
