# CRM Setup Guide

## ✅ Step 1: Install Dependencies

Run this command in your terminal:

```bash
npm install
```

This will install the Supabase client library.

## ✅ Step 2: Set Up Database

1. Go to your Supabase project: https://cuvdmuvnkllxtnwpaotx.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `database-setup.sql` file in this project
5. Copy the entire contents
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. You should see "Success. No rows returned"

This creates:
- `contacts` table
- `activities` table
- Security policies (allows authenticated users)
- Indexes for performance

## ✅ Step 3: Enable Authentication

1. In Supabase, go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. (Optional) Enable **Google** or **GitHub** for easier login

## ✅ Step 4: Run the App

```bash
npm run dev
```

Then:
1. Open http://localhost:5173
2. Click **Sign Up** to create your first account
3. Start adding contacts!

## 🎉 You're Ready!

Your CRM is now set up with:
- ✅ Multi-user authentication
- ✅ Contacts management
- ✅ Activities tracking
- ✅ Real-time updates
- ✅ Dashboard with statistics

## Features

- **Dashboard**: View statistics (total contacts, leads, prospects, customers)
- **Contacts**: Add, edit, delete, search, and filter contacts
- **Activities**: Track calls, emails, meetings, and notes
- **Real-time**: All users see changes instantly
- **Multi-user**: Multiple people can use it simultaneously

## Next Steps

1. Create your first account
2. Add some contacts
3. Track activities
4. Invite other users to sign up!



