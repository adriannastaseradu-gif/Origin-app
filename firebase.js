import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjgakAvC8G1SiwxkaoJCKkd7d-sRgQzeY",
  authDomain: "origin-app-489a4.firebaseapp.com",
  projectId: "origin-app-489a4",
  storageBucket: "origin-app-489a4.firebasestorage.app",
  messagingSenderId: "669338657246",
  appId: "1:669338657246:web:92294f676e15858c787d4f",
  measurementId: "G-F39KQR71L7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Sign in anonymously
signInAnonymously(auth).catch((error) => {
  console.error('Error signing in anonymously:', error);
});

export { auth, db };

