# Supabase CRM Setup Guide

## Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project" (free)
3. Sign up with GitHub/Google/Email
4. Click "New Project"
5. Fill in:
   - **Name**: "Origin CRM" or "My CRM"
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
6. Click "Create new project"
7. Wait 2-3 minutes for setup

## Step 2: Get Your Credentials

1. In your Supabase project, click ⚙️ **Settings** (top right)
2. Go to **API** section
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

## Step 3: Create Database Tables

I'll provide SQL scripts to create the tables. Or you can use the Table Editor:

### Table 1: contacts

Go to **Table Editor** → **New Table** → Name: `contacts`

Add columns:
- `id` - uuid, Primary Key, Default: `gen_random_uuid()`
- `name` - text, Required
- `email` - text
- `phone` - text
- `company` - text
- `status` - text (default: 'lead')
- `notes` - text
- `created_by` - uuid, Foreign Key → auth.users(id)
- `created_at` - timestamp, Default: `now()`
- `updated_at` - timestamp, Default: `now()`

### Table 2: activities

Go to **Table Editor** → **New Table** → Name: `activities`

Add columns:
- `id` - uuid, Primary Key, Default: `gen_random_uuid()`
- `contact_id` - uuid, Foreign Key → contacts(id)
- `type` - text (call, email, meeting, note)
- `description` - text
- `user_id` - uuid, Foreign Key → auth.users(id)
- `created_at` - timestamp, Default: `now()`

## Step 4: Enable Row Level Security (RLS)

For each table:

1. Go to **Table Editor** → Click on table
2. Click **Enable RLS**
3. Create policy:
   - **Name**: "Allow authenticated users"
   - **Policy**: `auth.role() = 'authenticated'`
   - **Operations**: SELECT, INSERT, UPDATE, DELETE
4. Save

## Step 5: Enable Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. (Optional) Enable **Google** or **GitHub** for easier login

## Step 6: Share Credentials

Once you have:
- Project URL
- anon public key

Share them with me and I'll build the CRM interface!


