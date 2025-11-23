# Firebase Setup Guide

Follow these steps to connect your Task Manager app to Firebase:

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter a project name
   - (Optional) Enable Google Analytics
   - Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started**
3. Go to the **Sign-in method** tab
4. Enable **Anonymous** authentication:
   - Click on "Anonymous"
   - Toggle it to **Enabled**
   - Click **Save**

## Step 3: Create Firestore Database

1. In your Firebase project, go to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location for your database (choose the closest to you)
5. Click **Enable**

## Step 4: Get Your Firebase Configuration

1. In your Firebase project, click the gear icon ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Scroll down to **Your apps** section
4. Click the **Web** icon (`</>`) to add a web app
5. Register your app with a nickname (e.g., "Task Manager")
6. Copy the Firebase configuration object

## Step 5: Update firebase.js

1. Open `firebase.js` in your project
2. Replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 6: Set Firestore Security Rules (Important!)

1. Go to **Firestore Database** → **Rules** tab
2. Update the rules to allow authenticated users to read/write:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

## Step 7: Test Your App

1. Start your development server: `npm run dev`
2. Open the app in your browser
3. You should see "Connecting to Firebase..." briefly
4. Try adding a task - it should sync to Firebase!

## Troubleshooting

- **"Failed to load tasks"**: Check your Firebase config in `firebase.js`
- **Authentication errors**: Make sure Anonymous auth is enabled
- **Permission denied**: Check your Firestore security rules
- **Connection issues**: Verify your Firebase project is active

## Security Note

For production, update your Firestore rules to be more restrictive. The current setup allows any authenticated user to read/write all tasks.

