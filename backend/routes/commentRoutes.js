const express = require("express");
const router = express.Router();
const {
  createComment,
  getApprovedCommentsByProduct,
  approveComment,
  rejectComment,
  getAverageRating
} = require("../controllers/commentController");

router.post("/", createComment);
router.get("/average/:productId", getAverageRating);
router.get("/:productId", getApprovedCommentsByProduct);
router.patch("/approve/:commentId", approveComment);
router.patch("/reject/:commentId", rejectComment);

module.exports = router;