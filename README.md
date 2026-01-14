# TextBin Rooms

A private text-sharing application built with Next.js and Supabase.

## Features

- **Private Rooms**: Create rooms tied to your account. Only you can see them.
- **Secure Authentication**: Email/Password login via Supabase Auth.
- **Auto-Cleanup**: The system maintains a maximum of 20 rooms per user. Oldest rooms are deleted automatically when new ones are created.
- **Message Limits**: Each room holds a maximum of 500 messages. Oldest messages are deleted automatically when new ones are sent.
- **File Attachments**: Upload images and files. Files are stored securely in private folders.
- **Storage Cleanup**: File attachments are automatically deleted from storage when their associated messages are removed.
- **Markdown Support**: Messages are rendered using Markdown.

## Setup

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup (Crucial)

You must apply the database schema and the authentication policies.

**Option A: Automated Script (Recommended)**
Get your "Transaction Mode" or "Session Mode" connection string from Supabase (Settings -> Database -> Connection String).

```bash
# Run the setup script (creates tables)
node scripts/migrate.js
```

**Option B: Manual Setup**
1. Copy the contents of `schema.sql` and run it in the Supabase SQL Editor.
2. Copy the contents of `scripts/auth_migration.sql` and run it in the Supabase SQL Editor to enable Authentication and Row Level Security.

### 3. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser. You will be redirected to `/login`.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Native Auth
- **Styling**: Tailwind CSS + @tailwindcss/typography
- **Markdown**: react-markdown
