const router = require("express").Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updatePricing,
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
router.patch(
  "/:id/pricing",
  authMiddleware,
  requireRole("sales_manager"),
  updatePricing
);

module.exports = router;
