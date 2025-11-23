-- Supabase CRM Database Setup
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'prospect', 'customer', 'inactive')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note')),
  description TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies for contacts
-- Allow authenticated users to read all contacts
CREATE POLICY "Allow authenticated users to read contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert contacts
CREATE POLICY "Allow authenticated users to insert contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update contacts
CREATE POLICY "Allow authenticated users to update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete contacts
CREATE POLICY "Allow authenticated users to delete contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for activities
-- Allow authenticated users to read all activities
CREATE POLICY "Allow authenticated users to read activities"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert activities
CREATE POLICY "Allow authenticated users to insert activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update activities
CREATE POLICY "Allow authenticated users to update activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete activities
CREATE POLICY "Allow authenticated users to delete activities"
  ON activities FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_created_by ON contacts(created_by);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);

