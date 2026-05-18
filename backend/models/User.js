const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["customer", "sales_manager", "product_manager"],
    default: "customer",
  },
  taxId: { type: String, default: "" },
  address: { type: String, default: "" },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product", default: [] }],
  emailPreferences: {
    wishlistDiscounts: { type: Boolean, default: false },
    wishlistRestock: { type: Boolean, default: false },
  },
  notifications: [{
    type: { type: String, enum: ["discount", "restock"], default: "discount" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    originalPrice: { type: Number, default: 0 },
    discountedPrice: { type: Number, default: 0 },
    discountRate: { type: Number, default: 0 },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }],
  avatar: { type: String, default: null },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
