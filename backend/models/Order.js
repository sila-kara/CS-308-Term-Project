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
    enum: ["processing", "in-transit", "delivered"],
    default: "processing",
  },
  invoiceNumber: { type: String },
}, { timestamps: true });

// Auto-generate invoice number before saving
orderSchema.pre("save", function (next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = `INV-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
