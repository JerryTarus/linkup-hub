-- 1. Announcements Table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id), -- Link to the admin who created it
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Chat Rooms Table (for private & group chats)
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT, -- Optional name for group chats
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Chat Participants (Junction Table)
-- Links users to chat rooms
CREATE TABLE chat_participants (
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id) -- A user can only be in a room once
);

-- 4. Chat Messages Table
CREATE TABLE chat_messages (
  id BIGSERIAL PRIMARY KEY, -- Use BIGSERIAL for high-volume chat messages
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for new tables
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Announcements: Anyone authenticated can read them. Only admins can create them.
CREATE POLICY "Allow authenticated read access to announcements" ON announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admins to create announcements" ON announcements FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'Super Admin'));

-- Chat: Users can only see/interact with rooms they are participants in.
CREATE POLICY "Allow users to see rooms they are in" ON chat_rooms FOR SELECT USING (id IN (SELECT room_id FROM chat_participants WHERE user_id = auth.uid()));
CREATE POLICY "Allow users to see participants of their rooms" ON chat_participants FOR SELECT USING (room_id IN (SELECT room_id FROM chat_participants WHERE user_id = auth.uid()));
CREATE POLICY "Allow participants to read messages in their rooms" ON chat_messages FOR SELECT USING (room_id IN (SELECT room_id FROM chat_participants WHERE user_id = auth.uid()));
CREATE POLICY "Allow participants to send messages in their rooms" ON chat_messages FOR INSERT WITH CHECK (room_id IN (SELECT room_id FROM chat_participants WHERE user_id = auth.uid()) AND user_id = auth.uid());