const nodemailer = require("nodemailer");

const sendInvoiceEmail = async (toEmail, order) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const itemList = order.items
    .map((i) => `${i.name} x${i.quantity} - $${i.price}`)
    .join("\n");

  const info = await transporter.sendMail({
    from: '"BookWorld Store" <noreply@bookworld.com>',
    to: toEmail,
    subject: `Invoice ${order.invoiceNumber}`,
    text: `
Thank you for your order!

Invoice: ${order.invoiceNumber}
Date: ${order.createdAt}

Items:
${itemList}

Subtotal: $${order.subtotal}
Tax: $${order.tax}
Total: $${order.total}

Delivery Address: ${order.deliveryAddress}
    `,
  });

  console.log("Email sent:", nodemailer.getTestMessageUrl(info));
};

module.exports = sendInvoiceEmail;