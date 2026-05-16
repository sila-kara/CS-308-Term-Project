const router = require("express").Router();
const {
  createCategory,
  deleteCategory,
  getCategories,
} = require("../controllers/categoryController");
const { authMiddleware, requireRole } = require("../middleware/auth");

router.post("/", authMiddleware, requireRole("product_manager"), createCategory);
router.get("/", getCategories);
router.delete("/:id", authMiddleware, requireRole("product_manager"), deleteCategory);

module.exports = router;
