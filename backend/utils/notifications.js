// backend/utils/notifications.js
const admin = require('firebase-admin');
const User = require('../models/User');
const Order = require('../models/Order');

const sendTransactionUpdateNotification = async (orderId, status) => {
  try {
    const order = await Order.findById(orderId).populate('user');
    if (!order || !order.user || !order.user.fcmToken) {
      console.error('Order or user not found, or FCM token missing');
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

    await admin.messaging().send(payload);
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error.message);
  }
};

module.exports = sendTransactionUpdateNotification;