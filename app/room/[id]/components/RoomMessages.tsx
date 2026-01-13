'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { getNewMessages } from '@/app/actions';

interface Message {
  id: number;
  room_id: string;
  content: string;
  created_at: string;
}

interface RoomMessagesProps {
  initialMessages: Message[];
  roomId: string;
  fetchNewMessages?: (roomId: string, lastId: number) => Promise<Message[]>;
}

export default function RoomMessages({ initialMessages, roomId, fetchNewMessages = getNewMessages }: RoomMessagesProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    // Sync state when initialMessages updates (e.g. after sending a message triggers revalidatePath)
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        const lastId = lastMessage ? lastMessage.id : 0;

        const newMessages = await fetchNewMessages(roomId, lastId);

        if (newMessages && newMessages.length > 0) {
          setMessages((prev) => {
             // Deduplicate just in case, though logic suggests we only get newer ones
             // We can check the last ID again to be safe against race conditions
             const currentLastId = prev.length > 0 ? prev[prev.length - 1].id : 0;
             const reallyNew = newMessages.filter((m: Message) => m.id > currentLastId);

             if (reallyNew.length === 0) return prev;
             return [...prev, ...reallyNew];
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 15000); // 15 seconds

    return () => clearInterval(intervalId);
  }, [roomId, messages, fetchNewMessages]); // Dependencies: messages is needed to get the latest lastId

  return (
    <div className="flex-1 overflow-y-auto space-y-6 mb-6 px-2">
      {messages && messages.length > 0 ? (
        messages.map((msg) => (
          <div key={msg.id} className="group">
            <div className="flex items-baseline justify-between mb-1">
               <span className="text-xs text-gray-400" suppressHydrationWarning>
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
  );
}
