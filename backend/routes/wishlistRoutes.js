const router = require("express").Router();
const { getWishlist, addToWishlist, removeFromWishlist } = require("../controllers/wishlistController");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, getWishlist);
router.post("/:productId", authMiddleware, addToWishlist);
router.delete("/:productId", authMiddleware, removeFromWishlist);

module.exports = router;