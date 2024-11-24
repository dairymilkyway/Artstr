// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getMessaging, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAuAHNRTGWyL-y8QGwX43YGED5j8n2HIf0",
  authDomain: "mern-stack-2ff5b.firebaseapp.com",
  projectId: "mern-stack-2ff5b",
  storageBucket: "mern-stack-2ff5b.firebasestorage.app",
  messagingSenderId: "41775657194",
  appId: "1:41775657194:web:fd1ce6d3128b492e846793",
  measurementId: "G-DHVKMD47ZE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const messaging = getMessaging(app);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((err) => {
      console.error('Service Worker registration failed: ', err);
    });
}

export { auth, googleProvider, messaging, onMessage };