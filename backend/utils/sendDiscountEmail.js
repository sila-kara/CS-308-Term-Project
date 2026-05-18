const nodemailer = require("nodemailer");

async function sendDiscountEmail(toEmail, userName, product) {
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
    subject: `${product.name} from your wishlist is on sale`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1f2937">
        <div style="background:#047857;padding:20px 28px;border-radius:8px 8px 0 0">
          <h2 style="margin:0;color:#fff;font-size:18px">Wishlist discount alert</h2>
        </div>
        <div style="background:#f8fafc;padding:24px 28px">
          <p>Hello <strong>${userName || "BookWorld reader"}</strong>,</p>
          <p><strong>${product.name}</strong>, a book in your wishlist, now has a <strong>${Math.round(product.discountRate)}% discount</strong>.</p>
          <p style="font-size:16px">
            <span style="color:#64748b;text-decoration:line-through">${Number(product.price).toFixed(2)} TL</span>
            <strong style="color:#047857;margin-left:8px">${Number(product.discountedPrice).toFixed(2)} TL</strong>
          </p>
          <a href="http://localhost:5173/product/${product._id}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#047857;color:#fff;text-decoration:none;border-radius:8px;font-weight:700">View product</a>
          <p style="font-size:12px;color:#94a3b8">You received this because the product is in your BookWorld wishlist.</p>
        </div>
      </div>
    `,
  });

  return true;
}

module.exports = sendDiscountEmail;
