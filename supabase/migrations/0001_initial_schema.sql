-- 1. Custom Types (Enums)
CREATE TYPE user_role AS ENUM ('Super Admin', 'Admin', 'Accountant', 'Member');
CREATE TYPE payment_status AS ENUM ('Pending', 'Completed', 'Failed');

-- 2. Profiles Table
-- This table extends the built-in auth.users table.
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL CHECK (char_length(username) >= 3),
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  profession TEXT,
  date_of_birth DATE,
  location TEXT,
  role user_role NOT NULL DEFAULT 'Member',
  is_shadow_banned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Events Table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  poster_url TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  is_free BOOLEAN NOT NULL DEFAULT TRUE,
  price NUMERIC(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. RSVPs (Tickets) Table
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  qr_code_data TEXT, -- Holds data for QR generation
  checked_in BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id) -- A user can only RSVP once per event
);

-- 5. Payments Table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  event_id UUID NOT NULL REFERENCES events(id),
  amount NUMERIC(10, 2) NOT NULL,
  phone_number TEXT NOT NULL,
  checkout_request_id TEXT UNIQUE NOT NULL, -- From Daraja
  merchant_request_id TEXT UNIQUE NOT NULL, -- From Daraja
  status payment_status NOT NULL DEFAULT 'Pending',
  daraja_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Chat Messages & Announcements will be handled by Supabase Realtime
-- For simplicity, we'll start with this schema.

-- ROW LEVEL SECURITY (RLS) --
-- This is the most critical part for security.

-- Enable RLS for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
CREATE POLICY "Users can view all profiles." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile." ON profiles FOR UPDATE USING (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'Super Admin');

-- Policies for Events
CREATE POLICY "Anyone can view events." ON events FOR SELECT USING (true);
CREATE POLICY "Admins can create events." ON events FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'Super Admin'));
CREATE POLICY "Admins can update events." ON events FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'Super Admin'));

-- Policies for RSVPs
CREATE POLICY "Users can see their own RSVPs." ON rsvps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own RSVPs." ON rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all RSVPs." ON rsvps FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('Admin', 'Super Admin'));

-- Policies for Payments
CREATE POLICY "Users can see their own payments." ON payments FOR SELECT USING (auth.uid() = user_id);
-- Note: All payment creation/updates are handled by the secure backend via SERVICE_ROLE_KEY.