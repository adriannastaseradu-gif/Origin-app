# How to Check if Tasks are in Firestore

## Step 1: Go to Firestore Database (NOT Analytics)

1. In Firebase Console, click **"Firestore Database"** in the left sidebar
   - It's under "Project Shortcuts" or under "Build" section
   - **NOT** "Analytics Dashboard" (that's what you're looking at now)

2. You should see two tabs: **"Data"** and **"Rules"**

## Step 2: Check the Data Tab

1. Click the **"Data"** tab
2. Look for a collection called **"tasks"**
   - If you don't see it, tasks haven't been saved yet
   - If you see it, click on it to see the documents

## Step 3: What You Should See

Each task document should have:
- `text`: "Your task text"
- `userId`: "telegram_123456" or "user_..."
- `completed`: false
- `createdAt`: timestamp
- `updatedAt`: timestamp

## Step 4: Test Right Now

1. Open your app in Telegram
2. Add a task: "Test Task"
3. Immediately go to Firebase Console → Firestore Database → Data
4. Refresh the page
5. You should see a new document in the "tasks" collection

## If You Don't See Tasks

1. **Check Firestore Rules:**
   - Go to Firestore Database → Rules tab
   - Make sure rules allow read/write:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /tasks/{taskId} {
         allow read, write: if true;
       }
     }
   }
   ```
   - Click **Publish**

2. **Check Browser Console:**
   - Open your app
   - Open browser developer tools (if possible)
   - Look for console messages:
     - "Adding task with userId: ..."
     - "✅ Task added successfully!"
     - Any error messages

3. **Check if Firestore is Enabled:**
   - Make sure you created the Firestore database
   - Go to Firestore Database → if it says "Create database", do that first

