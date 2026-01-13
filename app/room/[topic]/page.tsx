import { sendMessage } from '@/app/actions';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import RoomMessages from './RoomMessages';

export const revalidate = 0; // Ensure fresh data on every request

interface PageProps {
  params: Promise<{ topic: string }>;
}

export default async function RoomPage({ params }: PageProps) {
  const { topic } = await params;
  const decodedTopic = decodeURIComponent(topic);

  // 1. Fetch Room Details
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('topic', decodedTopic)
    .single();

  if (roomError || !room) {
    notFound();
  }

  // 2. Fetch Messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', room.id)
    .order('created_at', { ascending: true });

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
        <div>
          <h1 className="text-2xl font-bold truncate">{room.topic}</h1>
          <p className="text-xs text-gray-500 font-mono">{room.id}</p>
        </div>
        <div className="flex gap-2">
           <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
          >
            Home
          </Link>
          <a
            href={`/room/${topic}`} // Simple refresh
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            Refresh
          </a>
        </div>
      </header>

      {/* Messages List (Scrollable) */}
      <RoomMessages
        initialMessages={messages || []}
        roomId={room.id}
        topic={room.topic}
      />

      {/* Input Area (Fixed at bottom) */}
      <div className="shrink-0 pt-4 border-t border-gray-200 dark:border-zinc-800 bg-background">
        <form
          action={sendMessage.bind(null, room.id, room.topic)}
          className="flex flex-col gap-2"
        >
          <textarea
            name="content"
            placeholder="Type your message here (Markdown supported)..."
            className="w-full h-32 p-4 rounded-lg border border-gray-300 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700"
          />
          <div className="flex justify-between items-center">
            <label className="cursor-pointer text-gray-500 hover:text-blue-600 flex items-center gap-2">
              <input type="file" name="file" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400" />
            </label>
            <button
              type="submit"
              className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
