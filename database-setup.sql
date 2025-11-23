-- Supabase CRM Database Setup
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Create profiles table for Telegram users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  telegram_username TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security (we're using Telegram auth, not Supabase auth)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to read all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;

-- Create policies for profiles (allow all for now, since we're using Telegram auth)
CREATE POLICY "Allow users to read all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Allow users to insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow users to update own profile"
  ON profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'prospect', 'customer', 'inactive')),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to auto-update profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note')),
  description TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security (we're using Telegram auth, not Supabase auth)
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Allow authenticated users to read contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to insert contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to update contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to delete contacts" ON contacts;

-- Update policies to allow public access (since we're using Telegram auth)
-- Drop existing policies for contacts
DROP POLICY IF EXISTS "Allow authenticated users to read contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to insert contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to update contacts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated users to delete contacts" ON contacts;

-- Create policies for contacts (allow all for now, since we're using Telegram auth)
CREATE POLICY "Allow users to read contacts"
  ON contacts FOR SELECT
  USING (true);

CREATE POLICY "Allow users to insert contacts"
  ON contacts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow users to update contacts"
  ON contacts FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow users to delete contacts"
  ON contacts FOR DELETE
  USING (true);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read activities" ON activities;
DROP POLICY IF EXISTS "Allow authenticated users to insert activities" ON activities;
DROP POLICY IF EXISTS "Allow authenticated users to update activities" ON activities;
DROP POLICY IF EXISTS "Allow authenticated users to delete activities" ON activities;

-- Drop existing policies for activities
DROP POLICY IF EXISTS "Allow authenticated users to read activities" ON activities;
DROP POLICY IF EXISTS "Allow authenticated users to insert activities" ON activities;
DROP POLICY IF EXISTS "Allow authenticated users to update activities" ON activities;
DROP POLICY IF EXISTS "Allow authenticated users to delete activities" ON activities;

-- Create policies for activities (allow all for now, since we're using Telegram auth)
CREATE POLICY "Allow users to read activities"
  ON activities FOR SELECT
  USING (true);

CREATE POLICY "Allow users to insert activities"
  ON activities FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow users to update activities"
  ON activities FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow users to delete activities"
  ON activities FOR DELETE
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custom_statuses table for user-defined task statuses
CREATE TABLE IF NOT EXISTS custom_statuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, created_by)
);

-- Disable Row Level Security (we're using Telegram auth, not Supabase auth)
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE custom_statuses DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read tasks" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated users to insert tasks" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated users to update tasks" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated users to delete tasks" ON tasks;

-- Create policies for tasks
CREATE POLICY "Allow authenticated users to read tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (true);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read custom statuses" ON custom_statuses;
DROP POLICY IF EXISTS "Allow authenticated users to insert custom statuses" ON custom_statuses;
DROP POLICY IF EXISTS "Allow authenticated users to update custom statuses" ON custom_statuses;
DROP POLICY IF EXISTS "Allow authenticated users to delete custom statuses" ON custom_statuses;

-- Drop existing policies for custom_statuses
DROP POLICY IF EXISTS "Allow authenticated users to read custom statuses" ON custom_statuses;
DROP POLICY IF EXISTS "Allow authenticated users to insert custom statuses" ON custom_statuses;
DROP POLICY IF EXISTS "Allow authenticated users to update custom statuses" ON custom_statuses;
DROP POLICY IF EXISTS "Allow authenticated users to delete custom statuses" ON custom_statuses;

-- Create policies for custom_statuses (allow all for now, since we're using Telegram auth)
CREATE POLICY "Allow users to read custom statuses"
  ON custom_statuses FOR SELECT
  USING (true);

CREATE POLICY "Allow users to insert custom statuses"
  ON custom_statuses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow users to update custom statuses"
  ON custom_statuses FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow users to delete custom statuses"
  ON custom_statuses FOR DELETE
  USING (true);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

-- Create trigger to auto-update tasks updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_created_by ON contacts(created_by);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_contact_id ON tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_custom_statuses_created_by ON custom_statuses(created_by);

