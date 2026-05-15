const router = require("express").Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateStock,
} = require("../controllers/productController");
const { authMiddleware, requireRole } = require("../middleware/auth");

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post(
  "/",
  authMiddleware,
  requireRole("product_manager"),
  createProduct
);
router.patch(
  "/:id/stock",
  authMiddleware,
  requireRole("product_manager"),
  updateStock
);

module.exports = router;
