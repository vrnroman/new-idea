import { sendMessage } from '@/app/actions';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

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
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 px-2">
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className="group">
              <div className="flex items-baseline justify-between mb-1">
                 <span className="text-xs text-gray-400">
                    {new Date(msg.created_at).toLocaleString()}
                 </span>
              </div>
              <article className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 p-4 rounded-lg dark:bg-zinc-900/50">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </article>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-20 italic">
            No messages yet. Be the first to say something!
          </div>
        )}
      </div>

      {/* Input Area (Fixed at bottom) */}
      <div className="shrink-0 pt-4 border-t border-gray-200 dark:border-zinc-800 bg-background">
        <form
          action={async (formData) => {
            'use server';
            await sendMessage(room.id, room.topic, formData.get('content') as string);
          }}
          className="flex flex-col gap-2"
        >
          <textarea
            name="content"
            required
            placeholder="Type your message here (Markdown supported)..."
            className="w-full h-32 p-4 rounded-lg border border-gray-300 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700"
          />
          <button
            type="submit"
            className="self-end px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
