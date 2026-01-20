'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createRoom(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const topic = formData.get('topic') as string | null;

  if (!topic || !topic.trim()) {
    throw new Error('Topic is required');
  }
  const cleanTopic = topic.trim();

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
      .limit(count - 19);

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
    .insert([{ topic: cleanTopic, owner_id: user.id }])
    .select()
    .single();

  if (createError) {
    // Check for unique constraint violation (code 23505)
    if (createError.code === '23505') {
      revalidatePath('/');
      redirect(`/room/${encodeURIComponent(cleanTopic)}`);
    }
    console.error('Error creating room:', createError);
    throw new Error('Failed to create room');
  }

  revalidatePath('/');
  redirect(`/room/${encodeURIComponent(newRoom.topic)}`);
}

export async function sendMessage(roomId: string, topic: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const content = formData.get('content') as string;
  const file = formData.get('file') as File | null;

  if ((!content || !content.trim()) && (!file || file.size === 0)) return;

  let fileUrl: string | null = null;
  let filePath: string | null = null;

  // 1. Handle File Upload
  if (file && file.size > 0) {
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${sanitizedName}`;
    // Path: private/{user_id}/{room_id}/{filename}
    const path = `private/${user.id}/${roomId}/${fileName}`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('room-uploads')
      .upload(path, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error('Failed to upload file');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('room-uploads')
      .getPublicUrl(path);

    fileUrl = publicUrl;
    filePath = path;
  }

  // 2. Check message count
  const { count, error: countError } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', roomId);

  if (countError) {
    console.error('Error counting messages:', countError);
  }

  // 3. FIFO Logic
  if (count !== null && count >= 500) {
    const { data: oldestMessages, error: fetchError } = await supabase
      .from('messages')
      .select('id, file_path')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(count - 499);

    if (fetchError) {
      console.error('Error fetching oldest messages:', fetchError);
    } else if (oldestMessages && oldestMessages.length > 0) {
      const filesToDelete = oldestMessages
        .map((m) => m.file_path)
        .filter((path): path is string => path !== null);

      if (filesToDelete.length > 0) {
        const { error: storageDeleteError } = await supabase.storage
          .from('room-uploads')
          .remove(filesToDelete);

        if (storageDeleteError) {
          console.error('Error deleting old files:', storageDeleteError);
        }
      }

      const idsToDelete = oldestMessages.map((m) => m.id);
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        console.error('Error deleting oldest messages:', deleteError);
      }
    }
  }

  // 4. Insert the new message
  const { error: insertError } = await supabase
    .from('messages')
    .insert([{
      room_id: roomId,
      content: content || '',
      file_url: fileUrl,
      file_path: filePath,
      owner_id: user.id
    }]);

  if (insertError) {
    console.error('Error sending message:', insertError);
    throw new Error('Failed to send message');
  }

  revalidatePath(`/room/${encodeURIComponent(topic)}`);
}

export async function getNewMessages(roomId: string, lastMessageId: number) {
  const supabase = await createClient();

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
