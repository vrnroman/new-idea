'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createRoom(formData: FormData) {
  const topic = formData.get('topic') as string | null;

  // 1. Check total number of rooms
  const { count, error: countError } = await supabase
    .from('rooms')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting rooms:', countError);
    throw new Error('Failed to count rooms');
  }

  // 2. If count >= 20: Delete the oldest room
  if (count !== null && count >= 20) {
    const { data: oldestRooms, error: fetchError } = await supabase
      .from('rooms')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(count - 19); // Delete enough to make space, usually just 1

    if (fetchError) {
      console.error('Error fetching oldest room:', fetchError);
    } else if (oldestRooms && oldestRooms.length > 0) {
      const idsToDelete = oldestRooms.map(r => r.id);
      const { error: deleteError } = await supabase
        .from('rooms')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        console.error('Error deleting oldest room:', deleteError);
      }
    }
  }

  // 3. Create the new room
  const { data: newRoom, error: createError } = await supabase
    .from('rooms')
    .insert([{ topic: topic || 'Untitled Room' }])
    .select()
    .single();

  if (createError) {
    console.error('Error creating room:', createError);
    throw new Error('Failed to create room');
  }

  revalidatePath('/');
  redirect(`/room/${newRoom.id}`);
}

export async function sendMessage(roomId: string, content: string) {
  if (!content.trim()) return;

  // 1. Check message count for the current room_id
  const { count, error: countError } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', roomId);

  if (countError) {
    console.error('Error counting messages:', countError);
    // Continue anyway, maybe just a glitch, but ideally we should handle it
  }

  // 2. If count >= 500: Delete the oldest message in that room
  if (count !== null && count >= 500) {
    const { data: oldestMessages, error: fetchError } = await supabase
      .from('messages')
      .select('id')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(count - 499); // Delete to get back to 499 or fewer

    if (fetchError) {
      console.error('Error fetching oldest messages:', fetchError);
    } else if (oldestMessages && oldestMessages.length > 0) {
      const idsToDelete = oldestMessages.map(m => m.id);
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        console.error('Error deleting oldest messages:', deleteError);
      }
    }
  }

  // 3. Insert the new message
  const { error: insertError } = await supabase
    .from('messages')
    .insert([{ room_id: roomId, content: content }]);

  if (insertError) {
    console.error('Error sending message:', insertError);
    throw new Error('Failed to send message');
  }

  revalidatePath(`/room/${roomId}`);
}

export async function getNewMessages(roomId: string, lastMessageId: number) {
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .gt('id', lastMessageId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching new messages:', error);
    return [];
  }

  return messages;
}
