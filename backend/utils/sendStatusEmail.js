const nodemailer = require("nodemailer");

const STATUS_INFO = {
  "processing": {
    subject: "Your order is being prepared",
    title: "We're preparing your order!",
    body: "Great news — your payment has been confirmed and our team is now carefully preparing your parcel.",
    icon: "📦",
  },
  "in-transit": {
    subject: "Your order is on its way",
    title: "Your order has been shipped!",
    body: "Your books are on their way to you. You should receive them within 2–4 business days.",
    icon: "🚚",
  },
  "delivered": {
    subject: "Your order has been delivered",
    title: "Your order has arrived!",
    body: "Your order has been delivered. We hope you enjoy your books. Happy reading!",
    icon: "✅",
  },
};

const sendStatusEmail = async (toEmail, order, userName) => {
  const info = STATUS_INFO[order.status];
  if (!info) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"BookWorld" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${info.subject} — ${order.invoiceNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
        <div style="background:#1e3a8a;padding:20px 28px;border-radius:8px 8px 0 0">
          <h2 style="margin:0;color:#fff;font-size:18px">BookWorld</h2>
        </div>
        <div style="background:#f8fafc;padding:24px 28px">
          <p style="font-size:2rem;margin:0 0 8px">${info.icon}</p>
          <h3 style="margin:0 0 12px;font-size:1.1rem">${info.title}</h3>
          <p>Hello <strong>${userName || "there"}</strong>,</p>
          <p style="color:#475569">${info.body}</p>
          <div style="margin:20px 0;padding:14px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;color:#475569">
            <strong>Order:</strong> ${order.invoiceNumber}<br/>
            <strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1).replace("-", " ")}<br/>
            <strong>Total:</strong> ${order.total.toFixed(2)} TL
          </div>
          <p style="font-size:12px;color:#94a3b8">Questions? Email us at bookworld.store.cs308@gmail.com</p>
        </div>
      </div>
    `,
  });
};

module.exports = sendStatusEmail;
