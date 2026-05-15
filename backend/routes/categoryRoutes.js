const router = require("express").Router();
const {
  createCategory,
  getCategories,
} = require("../controllers/categoryController");
const { authMiddleware, requireRole } = require("../middleware/auth");

router.post("/", authMiddleware, requireRole("product_manager"), createCategory);
router.get("/", getCategories);

module.exports = router;
