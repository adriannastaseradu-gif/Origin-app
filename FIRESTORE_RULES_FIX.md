# Fix Firestore Rules - URGENT!

Your Firestore database is empty, which means tasks aren't being saved. This is likely a **Firestore Rules** issue.

## Step 1: Go to Firestore Rules

1. In Firebase Console, click **"Firestore Database"** (you're already there)
2. Click the **"Rules"** tab (next to "Data" tab)
3. You should see the current rules

## Step 2: Update Rules to Allow Writes

**Replace everything** with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**OR** if you want to be more specific (recommended):

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

## Step 3: Publish Rules

1. Click **"Publish"** button (top right)
2. Wait for confirmation that rules are published

## Step 4: Test Again

1. Go back to your app in Telegram
2. Add a task: "Test Task"
3. Go back to Firestore → Data tab
4. Refresh the page
5. You should now see a "tasks" collection with your task!

## Why This Happens

By default, Firestore rules block all reads/writes for security. You need to explicitly allow them. The rules above allow anyone to read/write (good for testing). For production, you'd want more restrictive rules.

