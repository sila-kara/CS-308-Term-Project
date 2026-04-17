const Comment = require("../models/Comment");

const maskName = (fullName) => {
  if (!fullName) return "";

  const parts = fullName.trim().split(" ");

  return parts
    .map((part) => {
      if (!part) return "";
      return part[0].toUpperCase() + "***";
    })
    .join(" ");
};

exports.createComment = async (req, res) => {
  try {
    const { userId, productId, rating, commentText } = req.body;

    if (!userId || !productId || !rating) {
      return res.status(400).json({
        message: "userId, productId and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const newComment = new Comment({
      userId,
      productId,
      rating,
      commentText: commentText || "",
      status: "pending",
    });

    await newComment.save();

    res.status(201).json({
      message: "Comment submitted successfully",
      comment: newComment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApprovedCommentsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const comments = await Comment.find({
      productId,
      status: "approved",
    }).populate("userId", "name");

    const formattedComments = comments.map((comment) => ({
      _id: comment._id,
      productId: comment.productId,
      rating: comment.rating,
      commentText: comment.commentText,
      createdAt: comment.createdAt,
      maskedUserName: maskName(comment.userId?.name || ""),
    }));

    res.status(200).json(formattedComments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      status: "pending",
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    const formattedComments = comments.map((comment) => ({
      _id: comment._id,
      productId: comment.productId,
      rating: comment.rating,
      commentText: comment.commentText,
      createdAt: comment.createdAt,
      maskedUserName: maskName(comment.userId?.name || ""),
    }));

    res.status(200).json(formattedComments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { role } = req.body;

    if (role !== "product_manager") {
      return res.status(403).json({
        message: "Only product managers can approve comments",
      });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { status: "approved" },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json({
      message: "Comment approved successfully",
      comment: updatedComment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { role } = req.body;

    if (role !== "product_manager") {
      return res.status(403).json({
        message: "Only product managers can reject comments",
      });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { status: "rejected" },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json({
      message: "Comment rejected successfully",
      comment: updatedComment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAverageRating = async (req, res) => {
  try {
    const { productId } = req.params;

    const comments = await Comment.find({
      productId,
      status: "approved",
    });

    if (comments.length === 0) {
      return res.status(200).json({
        averageRating: 0,
        totalComments: 0,
      });
    }

    const total = comments.reduce((sum, c) => sum + c.rating, 0);
    const average = total / comments.length;

    res.status(200).json({
      averageRating: average,
      totalComments: comments.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};