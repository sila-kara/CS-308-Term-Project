const router = require("express").Router();
const {
  createOrder, getOrdersByUser, getOrderById,
  advanceStatus, getAllOrders, requestReturn,
  approveReturn, rejectReturn, cancelOrder,
} = require("../controllers/orderController");
const { authMiddleware, requireRole } = require("../middleware/auth");

router.use(authMiddleware);

router.post("/", createOrder);
router.get("/", getOrdersByUser);
router.get("/admin/all", requireRole("product_manager"), getAllOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", requireRole("product_manager"), advanceStatus);
router.post("/:id/return", requestReturn);
router.patch("/:id/cancel", cancelOrder);
router.patch("/:id/return/approve", requireRole("product_manager"), approveReturn);
router.patch("/:id/return/reject", requireRole("product_manager"), rejectReturn);

module.exports = router;
