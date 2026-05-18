const nodemailer = require("nodemailer");

async function sendRestockEmail(toEmail, userName, product) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"BookWorld" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${product.name} from your wishlist is back in stock`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1f2937">
        <div style="background:#1d4ed8;padding:20px 28px;border-radius:8px 8px 0 0">
          <h2 style="margin:0;color:#fff;font-size:18px">Wishlist stock alert</h2>
        </div>
        <div style="background:#f8fafc;padding:24px 28px">
          <p>Hello <strong>${userName || "BookWorld reader"}</strong>,</p>
          <p><strong>${product.name}</strong>, a book in your wishlist, is back in stock.</p>
          <p style="font-size:16px"><strong style="color:#1d4ed8">${Number(product.quantity || 0)} available</strong></p>
          <a href="http://localhost:5173/product/${product._id}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:8px;font-weight:700">View product</a>
          <p style="font-size:12px;color:#94a3b8">You received this because the product is in your BookWorld wishlist and stock alerts are enabled.</p>
        </div>
      </div>
    `,
  });

  return true;
}

module.exports = sendRestockEmail;
