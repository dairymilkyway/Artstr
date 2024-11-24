const nodemailer = require('nodemailer');
require('dotenv').config(); // Add this at the top of your file
const sendTransactionEmail = async (order) => {
  try {
    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER, // Environment variable for Mailtrap user
        pass: process.env.MAILTRAP_PASS, // Environment variable for Mailtrap password
      },
    });

    // Populate product details for the items
    const populatedOrder = await order.populate('items.product');

    // Generate the items list with images
    const itemsList = populatedOrder.items
      .map(
        (item) => `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">
              <img src="${item.product.photos[0]}" alt="${item.product.name}" style="width: 50px; height: 50px; object-fit: cover;"/>
            </td>
            <td style="padding: 8px; border: 1px solid #ddd; color: #fff;">${item.product.name}</td>
            <td style="padding: 8px; border: 1px solid #ddd; color: #fff;">${item.quantity}</td>
            <td style="padding: 8px; border: 1px solid #ddd; color: #fff;">$${item.product.price.toFixed(2)}</td>
          </tr>
        `
      )
      .join('');

    // Calculate the shipping fee based on the courier
    let shippingFee = 0;
    if (order.courier === 'J&T Express') {
      shippingFee = 10;
    } else if (order.courier === 'Ninja Van') {
      shippingFee = 15;
    }

    // Calculate the subtotal
    const subtotal = populatedOrder.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    // Prepare email content
    const mailOptions = {
      from: '"Artstr" <no-reply@artstr.com>',
      to: order.email,
      subject: 'Your Order Details',
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #191414; color: #fff; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; text-align: center;">
          <img src="https://res.cloudinary.com/dnzxfbjfq/image/upload/v1732357343/lkvcodsmpzf2u1eincsv.png" alt="Artstr Logo" style="width: 150px; height: auto; margin-bottom: 20px;"/>
        </div>
        <div style="max-width: 600px; margin: 0 auto; background: #1DB954; border-radius: 10px; padding: 15px; text-align: center;">
          <h1 style="color: #191414; margin: 0;">Order Confirmation</h1>
          <p style="color: #191414; font-size: 1.1rem; margin: 10px 0 20px;">Thank you for shopping with Artstr, ${order.name}!</p>
        </div>
        <div style="max-width: 600px; margin: 20px auto; background: #191414; border-radius: 10px; padding: 20px;">
          <h2 style="color: #1DB954;">Order Details</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr>
                <th style="padding: 8px; border: 1px solid #ddd; background-color: #1DB954; color: #191414;">Image</th>
                <th style="padding: 8px; border: 1px solid #ddd; background-color: #1DB954; color: #191414;">Product</th>
                <th style="padding: 8px; border: 1px solid #ddd; background-color: #1DB954; color: #191414;">Quantity</th>
                <th style="padding: 8px; border: 1px solid #ddd; background-color: #1DB954; color: #191414;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>
          <div style="margin-top: 20px;">
            <p style="color: #fff;"><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
            <p style="color: #fff;"><strong>Courier:</strong> ${order.courier}</p>
            <p style="color: #fff;"><strong>Shipping Fee:</strong> $${shippingFee.toFixed(2)}</p>
            <p style="color: #fff;"><strong>Grand Total:</strong> $${order.totalPrice.toFixed(2)}</p>
          </div>
        </div>
        <div style="max-width: 600px; margin: 20px auto; background: #1DB954; border-radius: 10px; padding: 15px; text-align: center;">
          <p style="color: #191414; font-size: 1rem; margin: 0;">We hope you enjoy your purchase!</p>
          <p style="color: #191414; font-size: 0.9rem;">For any questions, contact us at support@artstr.com</p>
        </div>
      </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Transaction email sent successfully');
  } catch (error) {
    console.error('Error sending transaction email:', error.message);
  }
};

module.exports = sendTransactionEmail;