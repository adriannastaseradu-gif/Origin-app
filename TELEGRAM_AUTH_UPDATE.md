# Important: Update Database Policies for Telegram Auth

Since we're now using Telegram authentication instead of Supabase Auth, you need to update the database policies.

## Option 1: Disable RLS (Easier, but less secure)

Run this in Supabase SQL Editor:

```sql
-- Disable RLS for all tables (since we're using Telegram auth)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE custom_statuses DISABLE ROW LEVEL SECURITY;
```

## Option 2: Keep RLS but allow all (Recommended)

The updated `database-setup.sql` already has policies that allow all operations. Just make sure you run the updated SQL file.

## What Changed

- ✅ Removed email/password login
- ✅ Uses Telegram user ID for authentication
- ✅ Auto-creates user profile from Telegram data
- ✅ No login form needed - automatic authentication

## Testing

1. Open the app in Telegram
2. It should automatically authenticate using your Telegram ID
3. Your profile will be created automatically
4. You can start using the CRM immediately!

