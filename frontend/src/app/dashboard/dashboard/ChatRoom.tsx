// Mark as a client component for hooks and interactivity.
'use client';

// Import React hooks, Supabase types, and the client-side Supabase instance.
import { useState, useEffect, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase/client'; // Your client component helper
import type { User } from '@supabase/supabase-js';

// Import UI components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define the shape of a chat message object for TypeScript.
type Message = {
  id: number;
  created_at: string;
  content: string;
  user_id: string;
  profiles: { // We'll join the profiles table to get the username
    username: string;
  };
};

// Define the props for our ChatRoom component.
interface ChatRoomProps {
  roomId: string; // The ID of the chat room to connect to.
  currentUser: User; // The currently authenticated user object from Supabase.
}

export default function ChatRoom({ roomId, currentUser }: ChatRoomProps) {
  // State to hold the array of messages.
  const [messages, setMessages] = useState<Message[]>([]);
  // State for the new message input field.
  const [newMessage, setNewMessage] = useState('');
  // Create a Supabase client instance safe for browser use.
  const supabase = createSupabaseBrowserClient();
  // Ref to hold the Supabase Realtime channel instance.
  const channelRef = useRef<RealtimeChannel | null>(null);
  // Ref for the scroll area to auto-scroll to the bottom.
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // useEffect hook to fetch initial messages and set up the real-time subscription.
  useEffect(() => {
    // --- 1. Fetch initial messages ---
    const fetchMessages = async () => {
      // Query the chat_messages table, joining with profiles to get usernames.
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*, profiles(username)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else if (data) {
        // Set the initial messages in state.
        setMessages(data as any);
      }
    };

    fetchMessages();

    // --- 2. Set up Supabase Realtime subscription ---
    // The channel name must be unique, e.g., 'chat_room:roomId'.
    const channel = supabase.channel(`room:${roomId}`);

    channel
      .on(
        'postgres_changes', // Listen for changes in the PostgreSQL database.
        {
          event: 'INSERT', // Specifically, listen for new rows being inserted.
          schema: 'public',
          table: 'chat_messages', // In the 'chat_messages' table.
          filter: `room_id=eq.${roomId}`, // Only get events for this specific room.
        },
        async (payload) => {
          // When a new message is inserted, this callback fires.
          // The new message data is in payload.new.
          // We fetch the profile separately as joins aren't supported in realtime payloads yet.
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', payload.new.user_id)
            .single();

          // Combine the new message with the sender's username.
          const formattedNewMessage = { ...payload.new, profiles: { username: profile?.username || 'User' } } as Message;
          
          // Add the new message to our local state, triggering a re-render.
          setMessages((prevMessages) => [...prevMessages, formattedNewMessage]);
        }
      )
      .subscribe(); // Start listening for events.

    // Store the channel in a ref so we can unsubscribe later.
    channelRef.current = channel;

    // --- 3. Cleanup function ---
    // This runs when the component unmounts.
    return () => {
      if (channelRef.current) {
        // Unsubscribe from the channel to prevent memory leaks.
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [roomId, supabase]); // Re-run the effect if the roomId or supabase client changes.
  
  // useEffect to scroll to the bottom whenever messages state updates.
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);


  // Function to handle sending a new message.
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return; // Don't send empty messages.

    // Insert the new message into the database.
    const { error } = await supabase.from('chat_messages').insert({
      content: newMessage,
      room_id: roomId,
      user_id: currentUser.id,
    });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      // Clear the input field after sending.
      // The real-time subscription will handle adding it to the UI.
      setNewMessage('');
    }
  };

  // Render the chat room UI.
  return (
    <div className="flex flex-col h-[500px] border rounded-lg p-4 bg-white">
      <h2 className="text-xl font-bold mb-4">Community Chat</h2>
      <ScrollArea className="flex-grow mb-4 pr-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.user_id === currentUser.id ? 'justify-end' : ''
              }`}
            >
              <div
                className={`rounded-lg p-3 max-w-xs ${
                  msg.user_id === currentUser.id
                    ? 'bg-brand-accent text-white'
                    : 'bg-gray-200'
                }`}
              >
                {msg.user_id !== currentUser.id && (
                  <p className="text-xs font-bold text-brand-primary">
                    {msg.profiles.username}
                  </p>
                )}
                <p>{msg.content}</p>
                 <p className="text-xs opacity-70 mt-1 text-right">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          autoComplete="off"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}