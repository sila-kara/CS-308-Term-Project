const router = require("express").Router();
const { createOrder, getOrdersByUser, getOrderById, advanceStatus } = require("../controllers/orderController");
const { authMiddleware, requireRole } = require("../middleware/auth");

router.use(authMiddleware);

router.post("/", createOrder);
router.get("/", getOrdersByUser);
router.get("/:id", getOrderById);
router.patch("/:id/status", requireRole("product_manager"), advanceStatus);

module.exports = router;
