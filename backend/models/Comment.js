const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product"
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  commentText: {
    type: String,
    trim: true,
    default: ""
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Comment", commentSchema);