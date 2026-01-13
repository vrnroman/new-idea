'use client';

import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { getNewMessages } from '@/app/actions';

// Define the Message type based on the database schema
interface Message {
  id: number;
  room_id: string;
  content: string;
  created_at: string;
  file_url: string | null;
  file_path: string | null;
}

interface RoomMessagesProps {
  initialMessages: Message[];
  roomId: string;
  topic: string;
}

export default function RoomMessages({ initialMessages, roomId }: RoomMessagesProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  // Use a ref to keep track of the latest messages state for the polling interval
  const messagesRef = useRef<Message[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: isInitialMount.current ? 'auto' : 'smooth' });
      isInitialMount.current = false;
    }
  }, [messages]);

  // Sync state with props (e.g., after sending a message which triggers server revalidation)
  useEffect(() => {
    setMessages(initialMessages);
    messagesRef.current = initialMessages;
  }, [initialMessages]);

  useEffect(() => {
    const interval = setInterval(async () => {
      // Get the last message ID from the current state
      const currentMessages = messagesRef.current;
      const lastMessageId = currentMessages.length > 0
        ? Math.max(...currentMessages.map(m => m.id))
        : 0;

      const newMessages = await getNewMessages(roomId, lastMessageId);

      if (newMessages && newMessages.length > 0) {
        setMessages((prevMessages) => {
           // Deduping just in case, though the query logic should prevent duplicates
           const existingIds = new Set(prevMessages.map(m => m.id));
           const uniqueNewMessages = newMessages.filter((m: Message) => !existingIds.has(m.id));

           if (uniqueNewMessages.length === 0) return prevMessages;

           const updatedMessages = [...prevMessages, ...uniqueNewMessages];
           // Sort by created_at just to be safe
           updatedMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

           messagesRef.current = updatedMessages; // Update ref immediately
           return updatedMessages;
        });
      }
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, [roomId]);

  // Keep ref in sync when state updates from sources other than polling (e.g. initialMessages effect)
  useEffect(() => {
      messagesRef.current = messages;
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto space-y-6 mb-6 px-2">
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className="group">
              <div className="flex items-baseline justify-between mb-1">
                 <span className="text-xs text-gray-400">
                    {/* Use suppressHydrationWarning because server time and client time might differ */}
                    <span suppressHydrationWarning>
                        {new Date(msg.created_at).toLocaleString()}
                    </span>
                 </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg dark:bg-zinc-900/50">
                {msg.file_url && (
                  <div className="mb-4">
                    {msg.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={msg.file_url}
                        alt="Attachment"
                        className="max-h-[300px] w-auto rounded-lg"
                      />
                    ) : (
                      <a
                        href={msg.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5"
                        >
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        Download Attachment
                      </a>
                    )}
                  </div>
                )}
                {msg.content && (
                  <article className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </article>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-20 italic">
            No messages yet. Be the first to say something!
          </div>
        )}
        <div ref={bottomRef} />
      </div>
  );
}
