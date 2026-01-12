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

### 2. Database Setup

Run the SQL commands in `schema.sql` in your Supabase SQL Editor to set up the tables and policies.

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
