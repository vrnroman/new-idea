import { createRoom } from './actions';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { SubmitButton } from './components/SubmitButton';
import { redirect } from 'next/navigation';

export const revalidate = 0; // Ensure fresh data on every request

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch recent rooms (RLS filters by owner_id)
  const { data: recentRooms } = await supabase
    .from('rooms')
    .select('id, topic, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto space-y-12 font-[family-name:var(--font-geist-sans)]">
      <header className="text-center space-y-4 relative">
        <h1 className="text-4xl font-bold tracking-tight">TextBin Rooms</h1>
        <p className="text-gray-500">Private text sharing with auto-cleanup.</p>
        {user && (
            <div className="absolute top-0 right-0">
                <form action={signOut}>
                    <button className="text-sm text-red-600 hover:text-red-500 underline">Sign Out</button>
                </form>
                <p className="text-xs text-gray-400 mt-1">{user.email}</p>
            </div>
        )}
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Create Room Section */}
        <section className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
          <h2 className="text-xl font-semibold">Create Room</h2>
          <form action={createRoom} className="space-y-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium mb-1">
                Topic (Required)
              </label>
              <input
                type="text"
                name="topic"
                id="topic"
                required
                placeholder="e.g. Project Ideas"
                className="w-full rounded-md border border-gray-300 p-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
            <SubmitButton
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              pendingText="Creating..."
            >
              Create New Room
            </SubmitButton>
          </form>
        </section>

        {/* Join by Topic Section */}
        <section className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800">
          <h2 className="text-xl font-semibold">Go to Room</h2>
          <form
            action={async (formData) => {
              'use server';
              const topic = formData.get('topic') as string;
              if (topic && topic.trim()) {
                 const { redirect } = await import('next/navigation');
                 redirect(`/room/${encodeURIComponent(topic.trim())}`);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="topic" className="block text-sm font-medium mb-1">
                Topic
              </label>
              <input
                type="text"
                name="topic"
                id="topic"
                required
                placeholder="Enter exact topic..."
                className="w-full rounded-md border border-gray-300 p-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
            <SubmitButton
              className="w-full rounded-md bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
              pendingText="Going..."
            >
              Go to Room
            </SubmitButton>
          </form>
        </section>
      </div>

      {/* Recent Rooms Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Recent Rooms</h2>
        {recentRooms && recentRooms.length > 0 ? (
          <div className="grid gap-4">
            {recentRooms.map((room) => (
              <Link
                key={room.id}
                href={`/room/${encodeURIComponent(room.topic || '')}`}
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
