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

-- Create clients table (renamed to projects)
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remove status column from clients table if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'status'
  ) THEN
    ALTER TABLE clients DROP COLUMN status;
  END IF;
END $$;

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure created_by can be NULL (in case profile doesn't exist)
ALTER TABLE tasks ALTER COLUMN created_by DROP NOT NULL;

-- Fix foreign key constraint if it exists with wrong settings
DO $$
BEGIN
  -- Drop existing constraint if it doesn't allow NULL
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'tasks_created_by_fkey' AND table_name = 'tasks'
  ) THEN
    ALTER TABLE tasks DROP CONSTRAINT tasks_created_by_fkey;
  END IF;
END $$;

-- Recreate constraint with proper settings
ALTER TABLE tasks 
ADD CONSTRAINT tasks_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Add display_order column to clients table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE clients ADD COLUMN display_order INTEGER DEFAULT 0;
    -- Set initial display_order based on created_at using subquery
    UPDATE clients 
    SET display_order = sub.row_num
    FROM (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
      FROM clients
    ) AS sub
    WHERE clients.id = sub.id;
  END IF;
END $$;

-- Migrate existing tasks table if it has contact_id column
DO $$ 
BEGIN
  -- Check if contact_id column exists and rename it to client_id
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'contact_id'
  ) THEN
    ALTER TABLE tasks RENAME COLUMN contact_id TO client_id;
  END IF;
  
  -- Drop old foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'tasks_contact_id_fkey' AND table_name = 'tasks'
  ) THEN
    ALTER TABLE tasks DROP CONSTRAINT tasks_contact_id_fkey;
  END IF;
END $$;

-- Ensure foreign key constraint exists with correct name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'tasks_client_id_fkey' AND table_name = 'tasks'
  ) THEN
    ALTER TABLE tasks 
    ADD CONSTRAINT tasks_client_id_fkey 
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create custom_statuses table for user-defined task statuses
CREATE TABLE IF NOT EXISTS custom_statuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, created_by)
);

-- Ensure created_by can be NULL (in case profile doesn't exist)
ALTER TABLE custom_statuses ALTER COLUMN created_by DROP NOT NULL;

-- Fix foreign key constraint if it exists with wrong settings
DO $$
BEGIN
  -- Drop existing constraint if it doesn't allow NULL
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'custom_statuses_created_by_fkey' AND table_name = 'custom_statuses'
  ) THEN
    ALTER TABLE custom_statuses DROP CONSTRAINT custom_statuses_created_by_fkey;
  END IF;
END $$;

-- Recreate constraint with proper settings
ALTER TABLE custom_statuses 
ADD CONSTRAINT custom_statuses_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Disable Row Level Security (we're using Telegram auth, not Supabase auth)
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE custom_statuses DISABLE ROW LEVEL SECURITY;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
CREATE INDEX IF NOT EXISTS idx_clients_display_order ON clients(display_order);

-- Drop old index if it exists and create new one
DROP INDEX IF EXISTS idx_tasks_contact_id;
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);

-- Add display_order column to tasks table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'display_order'
  ) THEN
    ALTER TABLE tasks ADD COLUMN display_order INTEGER DEFAULT 0;
    -- Set initial display_order based on created_at using subquery
    UPDATE tasks 
    SET display_order = sub.row_num - 1
    FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY client_id ORDER BY created_at) as row_num
      FROM tasks
    ) AS sub
    WHERE tasks.id = sub.id;
  END IF;
END $$;

-- Create index for display_order after column is added
CREATE INDEX IF NOT EXISTS idx_tasks_display_order ON tasks(display_order);
CREATE INDEX IF NOT EXISTS idx_custom_statuses_created_by ON custom_statuses(created_by);
