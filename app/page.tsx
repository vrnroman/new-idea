import { createRoom } from './actions';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export const revalidate = 0; // Ensure fresh data on every request

export default async function Home() {
  // Fetch recent rooms
  const { data: recentRooms } = await supabase
    .from('rooms')
    .select('id, topic, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto space-y-12 font-[family-name:var(--font-geist-sans)]">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">TextBin Rooms</h1>
        <p className="text-gray-500">Anonymous text sharing with auto-cleanup.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Create Room Section */}
        <section className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
          <h2 className="text-xl font-semibold">Create Room</h2>
          <form action={createRoom} className="space-y-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium mb-1">
                Topic (Optional)
              </label>
              <input
                type="text"
                name="topic"
                id="topic"
                placeholder="e.g. Project Ideas"
                className="w-full rounded-md border border-gray-300 p-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Create New Room
            </button>
          </form>
        </section>

        {/* Join by ID Section */}
        <section className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
          <h2 className="text-xl font-semibold">Join by ID</h2>
          <form
            action={async (formData) => {
              'use server';
              const id = formData.get('roomId');
              if (id) {
                 // In server component we can't use router.push, so we use redirect
                 // But this is inside a form action, so it works.
                 // However, we need to import redirect.
                 const { redirect } = await import('next/navigation');
                 redirect(`/room/${id}`);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium mb-1">
                Room ID (UUID)
              </label>
              <input
                type="text"
                name="roomId"
                id="roomId"
                required
                pattern="^[0-9a-fA-F-]{36}$"
                placeholder="Paste UUID here..."
                className="w-full rounded-md border border-gray-300 p-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
            >
              Join Room
            </button>
          </form>
        </section>
      </div>

      {/* Recent Rooms Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Recent Rooms</h2>
        {recentRooms && recentRooms.length > 0 ? (
          <div className="grid gap-4">
            {recentRooms.map((room) => (
              <Link
                key={room.id}
                href={`/room/${room.id}`}
                className="block p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors dark:border-zinc-800 dark:hover:border-blue-500"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium truncate">{room.topic || 'Untitled Room'}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(room.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1 font-mono truncate">{room.id}</div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No rooms created yet.</p>
        )}
      </section>
    </div>
  );
}
