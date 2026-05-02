const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");

function generateInvoicePdf(order, userName) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(22).font("Helvetica-Bold").text("BookWorld", 50, 50);
    doc.fontSize(10).font("Helvetica").fillColor("#555")
      .text("bookworld.com  |  bookworld.store.cs308@gmail.com", 50, 78);

    doc.moveTo(50, 100).lineTo(545, 100).strokeColor("#ddd").stroke();

    // Invoice info
    doc.fillColor("#000").fontSize(18).font("Helvetica-Bold")
      .text("INVOICE", 50, 115);
    doc.fontSize(10).font("Helvetica")
      .text(`Invoice No: ${order.invoiceNumber}`, 50, 142)
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString("tr-TR")}`, 50, 157)
      .text(`Status: ${order.status}`, 50, 172);

    // Customer info
    doc.fontSize(10).font("Helvetica-Bold").text("Bill To:", 350, 142);
    doc.font("Helvetica")
      .text(userName || "Customer", 350, 157)
      .text(order.deliveryAddress || "—", 350, 172, { width: 195 });

    doc.moveTo(50, 210).lineTo(545, 210).strokeColor("#ddd").stroke();

    // Items table header
    let y = 225;
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#444")
      .text("Item", 50, y)
      .text("Qty", 360, y, { width: 50, align: "right" })
      .text("Unit Price", 410, y, { width: 70, align: "right" })
      .text("Total", 480, y, { width: 65, align: "right" });

    doc.moveTo(50, y + 14).lineTo(545, y + 14).strokeColor("#ddd").stroke();
    y += 22;

    // Items
    doc.font("Helvetica").fillColor("#000");
    for (const item of order.items) {
      doc.fontSize(9)
        .text(item.name, 50, y, { width: 300 })
        .text(String(item.quantity), 360, y, { width: 50, align: "right" })
        .text(`${item.price.toFixed(2)} TL`, 410, y, { width: 70, align: "right" })
        .text(`${(item.price * item.quantity).toFixed(2)} TL`, 480, y, { width: 65, align: "right" });
      y += 18;
    }

    doc.moveTo(50, y + 4).lineTo(545, y + 4).strokeColor("#ddd").stroke();
    y += 18;

    // Totals
    doc.fontSize(9).font("Helvetica")
      .text("Subtotal", 380, y, { width: 100, align: "right" })
      .text(`${order.subtotal.toFixed(2)} TL`, 480, y, { width: 65, align: "right" });
    y += 16;
    doc.text("Tax (10%)", 380, y, { width: 100, align: "right" })
      .text(`${order.tax.toFixed(2)} TL`, 480, y, { width: 65, align: "right" });
    y += 16;
    doc.font("Helvetica-Bold").fontSize(10)
      .text("Total", 380, y, { width: 100, align: "right" })
      .text(`${order.total.toFixed(2)} TL`, 480, y, { width: 65, align: "right" });

    // Payment note
    y += 32;
    doc.fontSize(9).font("Helvetica").fillColor("#555")
      .text(`Payment: ${order.paymentMethod} ending ${order.cardLast4}`, 50, y);

    // Footer
    doc.moveTo(50, 760).lineTo(545, 760).strokeColor("#ddd").stroke();
    doc.fontSize(8).fillColor("#888")
      .text("Thank you for shopping at BookWorld!", 50, 768, { align: "center", width: 495 });

    doc.end();
  });
}

const sendInvoiceEmail = async (toEmail, order, userName) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const pdfBuffer = await generateInvoicePdf(order, userName);

  const itemRows = order.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #eee">${i.name}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${(i.price * i.quantity).toFixed(2)} TL</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <div style="background:#1e3a8a;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="margin:0;color:#fff;font-size:22px">BookWorld</h1>
      </div>
      <div style="background:#f8fafc;padding:24px 32px">
        <p style="margin:0 0 8px;font-size:15px">Hello, <strong>${userName || "Valued Customer"}</strong>!</p>
        <p style="margin:0 0 20px;color:#475569;font-size:14px">Thank you for your order. Please find your invoice attached as a PDF.</p>

        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:16px">
          <p style="margin:0 0 4px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.05em">Invoice number</p>
          <p style="margin:0 0 16px;font-size:18px;font-weight:700">${order.invoiceNumber}</p>

          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead>
              <tr style="background:#f1f5f9">
                <th style="padding:8px;text-align:left;border-bottom:1px solid #e2e8f0">Item</th>
                <th style="padding:8px;text-align:center;border-bottom:1px solid #e2e8f0">Qty</th>
                <th style="padding:8px;text-align:right;border-bottom:1px solid #e2e8f0">Amount</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <div style="margin-top:12px;text-align:right;font-size:13px;color:#475569">
            <p style="margin:4px 0">Subtotal: ${order.subtotal.toFixed(2)} TL</p>
            <p style="margin:4px 0">Tax (10%): ${order.tax.toFixed(2)} TL</p>
            <p style="margin:8px 0 0;font-size:16px;font-weight:700;color:#1a1a1a">Total: ${order.total.toFixed(2)} TL</p>
          </div>
        </div>

        ${order.deliveryAddress ? `<p style="font-size:13px;color:#475569"><strong>Delivery address:</strong> ${order.deliveryAddress}</p>` : ""}

        <p style="font-size:12px;color:#94a3b8;margin-top:20px">Happy reading! — The BookWorld Team</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"BookWorld" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Your order is confirmed — ${order.invoiceNumber}`,
    html,
    attachments: [
      {
        filename: `${order.invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  console.log("Invoice email sent to:", toEmail, "| messageId:", order.invoiceNumber);
};

module.exports = sendInvoiceEmail;
