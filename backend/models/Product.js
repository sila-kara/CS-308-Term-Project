const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    model: { type: String, required: true },
    serialNumber: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    price: { type: Number, required: true, min: 0, default: 0 },
    cost: { type: Number, min: 0, default: 0 },
    discountRate: { type: Number, min: 0, max: 100, default: 0 },
    discountedPrice: { type: Number, min: 0, default: null },
    discountStartDate: { type: Date, default: null },
    discountEndDate: { type: Date, default: null },
    warranty: { type: String, default: "" },
    distributor: { type: String, default: "" },
    author: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
