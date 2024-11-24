// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAuAHNRTGWyL-y8QGwX43YGED5j8n2HIf0",
  authDomain: "mern-stack-2ff5b.firebaseapp.com",
  projectId: "mern-stack-2ff5b",
  storageBucket: "mern-stack-2ff5b.firebasestorage.app",
  messagingSenderId: "41775657194",
  appId: "1:41775657194:web:fd1ce6d3128b492e846793",
  measurementId: "G-DHVKMD47ZE"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title || 'Transaction Update';
  const notificationOptions = {
    body: payload.notification.body || 'Your transaction has been updated.',
    icon: payload.notification.icon || 'https://res.cloudinary.com/dnzxfbjfq/image/upload/v1732357343/lkvcodsmpzf2u1eincsv.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});