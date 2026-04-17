const express = require("express");
const router = express.Router();

const {
  createComment,
  getApprovedCommentsByProduct,
  getPendingComments,
  approveComment,
  rejectComment,
  getAverageRating,
} = require("../controllers/commentController");

router.post("/", createComment);
router.get("/average/:productId", getAverageRating);
router.get("/pending/all", getPendingComments);
router.get("/:productId", getApprovedCommentsByProduct);
router.patch("/approve/:commentId", approveComment);
router.patch("/reject/:commentId", rejectComment);

module.exports = router;