import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD3vplWlkU3qf08e6sMa8juq1q3EQkTf2g",
  authDomain: "artstr-da3e5.firebaseapp.com",
  projectId: "artstr-da3e5",
  storageBucket: "artstr-da3e5.firebasestorage.app",
  messagingSenderId: "1073562664968",
  appId: "1:1073562664968:web:fe68c3e3e08bccaef551bd",
  measurementId: "G-H3HYHBJ3JK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };