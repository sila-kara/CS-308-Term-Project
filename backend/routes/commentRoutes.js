const express = require("express");
const router = express.Router();
const {
  createComment,
  getMyCommentByProduct,
  getApprovedCommentsByProduct,
  approveComment,
  rejectComment,
  getAverageRating,
  getPendingComments,
} = require("../controllers/commentController");
const { authMiddleware, requireRole } = require("../middleware/auth");

router.post("/", authMiddleware, createComment);
router.get("/pending", authMiddleware, requireRole("product_manager"), getPendingComments);
router.get("/average/:productId", getAverageRating);
router.get("/mine/:productId", authMiddleware, getMyCommentByProduct);
router.get("/:productId", getApprovedCommentsByProduct);
router.patch("/approve/:commentId", authMiddleware, requireRole("product_manager"), approveComment);
router.patch("/reject/:commentId", authMiddleware, requireRole("product_manager"), rejectComment);

module.exports = router;
