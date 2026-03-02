# Water Days

A mobile-first PWA for tracking swim days toward a season goal (134 days out of 268).

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd water_days
npm install
```

### 2. Set up Supabase

1. Create a [Supabase](https://supabase.com) project
2. Run the migration in the Supabase SQL Editor:
   - Open `supabase/migrations/001_create_swim_logs.sql`
   - Copy and paste the contents into the SQL Editor
   - Click "Run"

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your Supabase project URL and anon key (found in Settings > API).

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

1. Push your repo to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy

### 6. Install as PWA

On iPhone: open the deployed URL in Safari, tap the share icon, and select "Add to Home Screen".

## Tech Stack

- **Next.js 15** (App Router)
- **Tailwind CSS v4**
- **Supabase** (Postgres)
- **Vercel** (hosting)
