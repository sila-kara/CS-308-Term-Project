const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  model: { type: String, required: true },
  serialNumber: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  price: { type: Number, required: true, min: 0 },
  warranty: { type: String, default: "" },
  distributor: { type: String, default: "" },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  image: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
