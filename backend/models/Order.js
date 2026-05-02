const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [orderItemSchema], required: true },
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: "Mock Visa" },
  cardLast4: { type: String, default: "****" },
  deliveryAddress: { type: String, default: "" },
  status: {
    type: String,
    enum: ["processing", "in-transit", "delivered", "cancelled"],
    default: "processing",
  },
  invoiceNumber: { type: String },
  shipping: { type: Number, default: 0 },
  returnStatus: { type: String, enum: [null, "requested", "approved", "rejected", "refunded"], default: null },
  returnRejectionReason: { type: String, default: "" },
  returnCargoCode: { type: String, default: null },
  returnCargoCompany: { type: String, default: null },
  returnItems: [{ type: String }],
  returnReason: { type: String, default: "" },
  returnRequestedAt: { type: Date, default: null },
}, { timestamps: true });

// Auto-generate invoice number before saving
orderSchema.pre("save", async function () {
  if (!this.invoiceNumber) {
    this.invoiceNumber = `INV-${Date.now()}`;
  }
});

module.exports = mongoose.model("Order", orderSchema);
