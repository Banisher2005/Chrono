# Chrono v1.0 — Setup Guide

## 1. Supabase (Database + Auth)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project** → name it `chrono` → set a database password → choose nearest region
3. Wait for the project to initialize (~2 minutes)
4. Go to **Settings → API** and copy:
   - `Project URL` → paste into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → paste as `SUPABASE_SERVICE_ROLE_KEY`
5. Go to **SQL Editor** → click **New Query** → paste the contents of `supabase/schema.sql` → click **Run**
6. Go to **Authentication → Providers**:
   - Enable **Google** → paste your Google Client ID and Secret (see step 2 below)
   - Enable **Microsoft** → paste your Azure Client ID and Secret (see step 3 below)
7. Go to **Authentication → URL Configuration**:
   - Set **Site URL** to `http://localhost:3000` (update to your Vercel URL after deployment)
   - Add `http://localhost:3000/auth/callback` to **Redirect URLs**

## 2. Google Cloud (OAuth + Calendar API)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project named `Chrono`
3. Go to **APIs & Services → Library**:
   - Search and enable **Google Calendar API**
4. Go to **APIs & Services → Credentials**:
   - Click **Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: add `https://<your-supabase-ref>.supabase.co/auth/v1/callback`
   - Copy **Client ID** → `.env.local` as `GOOGLE_CLIENT_ID`
   - Copy **Client Secret** → `.env.local` as `GOOGLE_CLIENT_SECRET`
5. Go to **OAuth consent screen**:
   - Choose **External** → fill in app name: `Chrono`
   - Add scopes: `email`, `profile`, `https://www.googleapis.com/auth/calendar`
   - Add yourself as a test user

## 3. Microsoft Azure (OAuth + Graph API)

1. Go to [portal.azure.com](https://portal.azure.com)
2. Go to **Microsoft Entra ID → App registrations → New registration**
   - Name: `Chrono`
   - Supported account types: **Personal Microsoft accounts + Work/School**
   - Redirect URI: `https://<your-supabase-ref>.supabase.co/auth/v1/callback`
3. Copy **Application (client) ID** → `.env.local` as `MICROSOFT_CLIENT_ID`
4. Go to **Certificates & secrets → New client secret** → copy value → `.env.local` as `MICROSOFT_CLIENT_SECRET`
5. Go to **API permissions → Add**:
   - `Calendars.ReadWrite`
   - `OnlineMeetings.Read`
   - `User.Read`

## 4. Google Gemini AI

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click **Create API Key** → select your project
3. Copy the key → `.env.local` as `GEMINI_API_KEY`

## 5. Vercel Deployment

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repository
3. Add all environment variables from `.env.local` to Vercel project settings
4. Update `NEXT_PUBLIC_SUPABASE_URL` redirect URLs to use your Vercel domain
