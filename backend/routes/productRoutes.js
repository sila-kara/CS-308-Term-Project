const router = require("express").Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
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
router.put(
  "/:id",
  authMiddleware,
  requireRole("product_manager"),
  updateProduct
);
router.delete(
  "/:id",
  authMiddleware,
  requireRole("product_manager"),
  deleteProduct
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
