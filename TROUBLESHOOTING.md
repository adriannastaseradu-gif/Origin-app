# Troubleshooting: Data Not Persisting

If your tasks disappear when you restart the app, follow these steps:

## Step 1: Check Browser Console

1. Open your app in Telegram
2. Open browser developer tools (if possible) or check Vercel logs
3. Look for console messages:
   - `Current user ID: ...` - Should show the same ID each time
   - `Setting up Firestore listener for userId: ...` - Should match the user ID
   - Any error messages

## Step 2: Verify Firestore Rules

Go to Firebase Console → Firestore Database → Rules and make sure you have:

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

Click **Publish** after updating.

## Step 3: Check Firestore Database

1. Go to Firebase Console → Firestore Database → Data
2. Look for a collection called `tasks`
3. Check if your tasks are being saved:
   - Do you see any documents?
   - Do they have a `userId` field?
   - Is the `userId` the same as what's shown in console?

## Step 4: Verify User ID Consistency

The app should use the same `userId` every time. Check:

1. Open browser console in your app
2. Type: `localStorage.getItem('telegram_user_id')`
3. Note the value
4. Close and reopen the app
5. Check again - it should be the SAME value

If it's different, that's the problem!

## Step 5: Test Data Saving

1. Add a new task
2. Immediately check Firestore Database → Data → tasks collection
3. You should see a new document with:
   - `text`: your task text
   - `userId`: your user ID
   - `completed`: false
   - `createdAt`: timestamp

## Common Issues

### Issue: User ID changes every time
**Solution**: The localStorage might be getting cleared. Make sure:
- You're not clearing browser data
- The app has permission to use localStorage

### Issue: Tasks save but don't load
**Solution**: Check Firestore query:
- Open console
- Look for error: "Index required"
- Create the index as shown in FIRESTORE_RULES.md

### Issue: No tasks in Firestore
**Solution**: Check:
- Firestore rules allow write
- Firebase config is correct
- Network connection is working

## Quick Test

1. Add a task: "Test Task 1"
2. Check Firestore → Data → tasks → you should see it
3. Close app completely
4. Reopen app
5. Task should still be there

If it's not there, check:
- Is the userId the same? (check console)
- Are tasks in Firestore? (check Firebase Console)
- Are Firestore rules correct? (check Rules tab)

