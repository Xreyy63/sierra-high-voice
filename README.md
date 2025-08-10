# Sierra High - Student Voice

This is a Next.js (App Router) starter app that lets students submit anonymous or identified reports to Sierra High. It includes:
- Voice-to-text (Web Speech API)
- File attachments (uploads to Supabase Storage)
- Draft autosave (localStorage)
- Server API route that stores submissions in Supabase

## What you need (free)
- A GitHub account (to host the repo)
- A free Supabase project (https://supabase.com)
- A free Vercel account (https://vercel.com) to deploy (optional, but recommended)

## Quick setup (local dev)

1. Clone this repo locally and `cd` into it.

2. Install dependencies:
```bash
npm install
```

3. Create a Supabase project:
- Go to https://app.supabase.com and create a free project.
- In the SQL Editor, run the table creation SQL:
```sql
create table submissions (
  id uuid primary key default gen_random_uuid(),
  type text,
  title text,
  details text,
  anonymous boolean,
  name text,
  grade text,
  location text,
  urgent boolean,
  file_url text,
  file_name text,
  submitted_at timestamptz default now()
);
```
- Create a Storage bucket named `submissions`. For a quick demo you can set it to public.

4. Create `.env.local` at project root with:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

5. Run the dev server:
```bash
npm run dev
```

6. Open http://localhost:3000

## Deployment
- Push to GitHub and import the repo into Vercel.
- Add the same environment variables in Vercel's dashboard (Project Settings → Environment Variables).
- Deploy.

## Security notes
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret; only used server-side in `app/api/submit/route.js`.
- For production, consider using signed URLs for private storage or restrict who can access submissions in Supabase.

