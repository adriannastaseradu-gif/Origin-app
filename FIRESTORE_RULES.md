# Firestore Security Rules for Task Manager

Since we're using Telegram user IDs instead of Firebase Authentication, update your Firestore rules as follows:

## Updated Security Rules

Go to **Firestore Database** → **Rules** tab in Firebase Console and use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      // Allow read and write for all users
      // The app filters tasks by userId on the client side
      allow read, write: if true;
    }
  }
}
```

## Alternative: More Secure Rules (Recommended for Production)

If you want more security, you can require that tasks have a userId field:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      // Allow read if the document exists
      allow read: if true;
      
      // Allow write only if userId is provided
      allow create: if request.resource.data.keys().hasAll(['userId', 'text', 'completed']);
      allow update: if request.resource.data.userId == resource.data.userId;
      allow delete: if true;
    }
  }
}
```

## Create Firestore Index (Important!)

When you first run a query with `where` and `orderBy`, Firebase will prompt you to create an index. 

1. Check your browser console for an error message with a link
2. Click the link to create the index automatically, OR
3. Go to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Set:
   - Collection ID: `tasks`
   - Fields to index:
     - `userId` (Ascending)
     - `createdAt` (Descending)
6. Click **Create**

## Testing

After updating the rules:
1. Deploy your app to Vercel
2. Open it in Telegram
3. Add a task - it should save
4. Close and reopen the app - your tasks should still be there!

