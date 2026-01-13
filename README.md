# TextBin Rooms

A lightweight, anonymous text-sharing application built with Next.js and Supabase.

## Features

- **Anonymous Rooms**: Create rooms instantly with an optional topic.
- **Auto-Cleanup**: The system maintains a maximum of 20 rooms. Oldest rooms are deleted automatically when new ones are created.
- **Message Limits**: Each room holds a maximum of 500 messages. Oldest messages are deleted automatically when new ones are sent.
- **Markdown Support**: Messages are rendered using Markdown.
- **No Sign-up**: Completely anonymous and open.

## Setup

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup (Crucial)

Since the app cannot create tables automatically for security reasons, you must set up the database schema once.

**Option A: Automated Script (Recommended)**
Get your "Transaction Mode" or "Session Mode" connection string from Supabase (Settings -> Database -> Connection String).

```bash
# Run the setup script
node scripts/migrate.js
# Paste your connection string when prompted
```

**Option B: Manual Setup**
1. Copy the contents of the `schema.sql` file in this repository.
2. Go to your Supabase Dashboard -> **SQL Editor**.
3. Paste the SQL and click **Run**.

### 3. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + @tailwindcss/typography
- **Markdown**: react-markdown
