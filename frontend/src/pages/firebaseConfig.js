import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDnbVXV3mtDFO5j7CNys17l9OTlxrFZUbE",
    authDomain: "mern-project-86af8.firebaseapp.com",
    projectId: "mern-project-86af8",
    storageBucket: "mern-project-86af8.firebasestorage.app",
    messagingSenderId: "351527233765",
    appId: "1:351527233765:web:43dff29e9103b777124c0c",
    measurementId: "G-SCQEQER7LJ"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };