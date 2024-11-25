// backend/utils/notifications.js
const admin = require('firebase-admin');
const User = require('../models/User');
const Order = require('../models/Order');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const sendTransactionUpdateNotification = async (orderId, status) => {
  try {
    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      console.error('Order not found');
      return;
    }
    if (!order.user) {
      console.error('User not found for order');
      return;
    }
    if (!order.user.fcmToken) {
      console.error('FCM token missing for user');
      return;
    }

    const payload = {
      notification: {
        title: 'Transaction Update',
        body: `Your order "${order.name}" has been ${status}.`,
      },
      webpush: {
        fcmOptions: {
          link: 'https://your-app-url.com'
        },
        notification: {
          icon: 'https://res.cloudinary.com/dnzxfbjfq/image/upload/v1732357343/lkvcodsmpzf2u1eincsv.png'
        }
      },
      token: order.user.fcmToken,
    };

    const response = await admin.messaging().send(payload);
    console.log('Notification sent successfully:', response);
  } catch (error) {
    console.error('Error sending notification:', error.message);
  }
};

module.exports = sendTransactionUpdateNotification;