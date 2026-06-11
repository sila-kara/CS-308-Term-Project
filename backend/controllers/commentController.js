const Comment = require("../models/Comment");
const Product = require("../models/Product");
const Order = require("../models/Order");

async function userHasDeliveredOrderForProduct(userId, productId) {
  const deliveredOrder = await Order.findOne({
    userId,
    status: "delivered",
    "items.productId": productId,
  });
  return !!deliveredOrder;
}

async function updateProductRating(productId) {
  const reviews = await Comment.find({ productId });

  const count = reviews.length;
  const avg =
    count > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / count
      : 0;

  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(avg * 10) / 10,
    ratingCount: count,
  });
}

const maskName = (fullName) => {
  if (!fullName) return "";

  const parts = fullName.trim().split(" ");

  return parts
    .map(part => {
      if (!part) return "";
      return part[0].toUpperCase() + "***";
    })
    .join(" ");
};

exports.createComment = async (req, res) => {
  try {
    const { productId, rating, commentText } = req.body;
    const userId = req.user?.id;

    if (!userId || !productId || !rating) {
      return res.status(400).json({
        message: "productId and rating are required"
      });
    }

    const numericRating = Number(rating);

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    const canReview = await userHasDeliveredOrderForProduct(userId, productId);

    if (!canReview) {
      return res.status(403).json({
        message: "You can only review products you have received."
      });
    }

    const trimmedText = String(commentText || "").trim();

    const commentStatus = trimmedText.length > 0 ? "pending" : "approved";

    let comment = await Comment.findOne({ userId, productId });
    let isUpdate = false;

    if (comment) {
      comment.rating = numericRating;
      comment.commentText = trimmedText;
      comment.commentStatus = commentStatus;
      isUpdate = true;
      await comment.save();
    } else {
      comment = await Comment.create({
        userId,
        productId,
        rating: numericRating,
        commentText: trimmedText,
        commentStatus
      });
    }

    await updateProductRating(productId);

    res.status(isUpdate ? 200 : 201).json({
      message: isUpdate
        ? "Review updated successfully"
        : "Review submitted successfully",
      comment,
      updated: isUpdate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkReviewEligibility = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;

    if (!userId || !productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const eligible = await userHasDeliveredOrderForProduct(userId, productId);

    res.status(200).json({ eligible });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyCommentByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;

    const comment = await Comment.findOne({ userId, productId });

    if (!comment) {
      return res.status(200).json(null);
    }

    res.status(200).json({
      _id: comment._id,
      userId: comment.userId,
      productId: comment.productId,
      rating: comment.rating,
      commentText: comment.commentText,
      commentStatus: comment.commentStatus,
      createdAt: comment.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApprovedCommentsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const comments = await Comment.find({ productId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    const formattedComments = comments.map(comment => ({
      _id: comment._id,
      userId: comment.userId?._id,
      productId: comment.productId,
      rating: comment.rating,
      commentText:
        comment.commentStatus === "approved" ? comment.commentText : "",
      commentStatus: comment.commentStatus,
      createdAt: comment.createdAt,
      maskedUserName: maskName(comment.userId?.name || "")
    }));

    res.status(200).json(formattedComments);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { commentStatus: "approved" },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await updateProductRating(updatedComment.productId);

    res.status(200).json({
      message: "Comment approved successfully",
      comment: updatedComment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        commentText: "",
        commentStatus: "rejected"
      },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await updateProductRating(updatedComment.productId);

    res.status(200).json({
      message: "Comment rejected successfully",
      comment: updatedComment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      commentStatus: "pending",
      commentText: { $ne: "" }
    })
      .populate("userId", "name")
      .populate("productId", "name")
      .sort({ createdAt: -1 });

    const formatted = comments.map(c => ({
      _id: c._id,
      productId: c.productId?._id,
      productName: c.productId?.name || "",
      rating: c.rating,
      commentText: c.commentText,
      commentStatus: c.commentStatus,
      createdAt: c.createdAt,
      maskedUserName: maskName(c.userId?.name || ""),
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAverageRating = async (req, res) => {
  try {
    const { productId } = req.params;

    const comments = await Comment.find({ productId });

    if (comments.length === 0) {
      return res.status(200).json({
        averageRating: 0,
        totalComments: 0
      });
    }

    const total = comments.reduce((sum, c) => sum + c.rating, 0);
    const average = total / comments.length;

    res.status(200).json({
      averageRating: average,
      totalComments: comments.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
