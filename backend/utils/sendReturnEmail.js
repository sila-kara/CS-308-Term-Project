const nodemailer = require("nodemailer");

const sendReturnEmail = async (toEmail, order, userName, type, rejectionReason = "") => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const isApproved = type === "approved";

  const subject = isApproved
    ? `Your return request has been approved — ${order.invoiceNumber}`
    : `Your return request has been declined — ${order.invoiceNumber}`;

  const html = isApproved ? `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
      <div style="background:#1e3a8a;padding:20px 28px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;color:#fff;font-size:18px">BookWorld</h2>
      </div>
      <div style="background:#f8fafc;padding:24px 28px">
        <p style="font-size:2rem;margin:0 0 8px">✅</p>
        <h3 style="margin:0 0 12px;font-size:1.1rem">Your return has been approved!</h3>
        <p>Hello <strong>${userName || "there"}</strong>,</p>
        <p style="color:#475569">Great news — your return request for order <strong>${order.invoiceNumber}</strong> has been approved.</p>
        <div style="margin:20px 0;padding:14px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;color:#475569">
          <strong>Cargo company:</strong> ${order.returnCargoCompany}<br/>
          <strong>Tracking code:</strong> <code style="background:#e2e8f0;padding:2px 6px;border-radius:4px">${order.returnCargoCode}</code><br/>
          <strong>Drop-off deadline:</strong> Within 7 days
        </div>
        <p style="color:#475569">Please drop off your parcel at any <strong>${order.returnCargoCompany}</strong> branch within <strong>7 days</strong> using the tracking code above.</p>
        <p style="font-size:12px;color:#94a3b8">Questions? Email us at bookworld.store.cs308@gmail.com</p>
      </div>
    </div>
  ` : `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
      <div style="background:#1e3a8a;padding:20px 28px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;color:#fff;font-size:18px">BookWorld</h2>
      </div>
      <div style="background:#f8fafc;padding:24px 28px">
        <p style="font-size:2rem;margin:0 0 8px">❌</p>
        <h3 style="margin:0 0 12px;font-size:1.1rem">Your return request has been declined</h3>
        <p>Hello <strong>${userName || "there"}</strong>,</p>
        <p style="color:#475569">Unfortunately your return request for order <strong>${order.invoiceNumber}</strong> could not be approved.</p>
        ${rejectionReason ? `
        <div style="margin:20px 0;padding:14px;background:#fff;border:1px solid #fecaca;border-radius:8px;font-size:13px;color:#475569">
          <strong>Reason:</strong> ${rejectionReason}
        </div>` : ""}
        <p style="color:#475569">If you have questions about this decision, please contact us.</p>
        <p style="font-size:12px;color:#94a3b8">Questions? Email us at bookworld.store.cs308@gmail.com</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"BookWorld" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html,
  });
};

module.exports = sendReturnEmail;
